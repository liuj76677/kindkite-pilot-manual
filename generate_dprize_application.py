import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import json
from pathlib import Path
import markdown
import pdfkit
from datetime import datetime

# Load environment variables
load_dotenv()

class DPrizeApplicationGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
        self.index = self.pc.Index('dprize-connect-ed')
        self.namespace = 'dprize'
        
    def search_relevant_info(self, query, top_k=5):
        """Search for relevant information in Pinecone."""
        # Get embedding for query
        response = self.client.embeddings.create(
            input=query,
            model="text-embedding-3-small"
        )
        query_embedding = response.data[0].embedding
        
        # Search in Pinecone
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            namespace=self.namespace,
            include_metadata=True
        )
        
        # Verify sources
        verified_matches = []
        for match in results.matches:
            if match.metadata.get('source_verification', {}).get('verified'):
                verified_matches.append(match)
            else:
                print(f"Warning: Unverified source found: {match.metadata.get('source', 'unknown')}")
        
        return verified_matches

    def generate_section(self, section_name, requirements):
        """Generate a section of the application using RAG."""
        # Search for relevant information
        matches = self.search_relevant_info(requirements)
        
        if not matches:
            raise ValueError(f"No verified information found for section: {section_name}")
        
        # Prepare context from matches
        context = "\n".join([match.metadata['text'] for match in matches])
        
        # Generate section content
        prompt = f"""Based on the following verified information and requirements, write a detailed section for the D-Prize application.
        
        Section: {section_name}
        Requirements: {requirements}
        
        Context (from verified sources):
        {context}
        
        Important: Only use information from the provided context. Do not make up or infer any information.
        If information is missing, clearly state what information is needed.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an expert grant writer. Only use information from verified sources. Never make up or infer information."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content

    def generate_full_application(self):
        """Generate the complete D-Prize application."""
        sections = {
            "Organization Overview": "Provide a comprehensive overview of the organization, including mission, vision, and track record.",
            "Implementation Model": "Detail the program implementation, including session delivery, instructor roles, and support structures.",
            "Data Collection System": "Describe the monitoring systems for tracking student learning and program quality.",
            "Government Engagement": "Outline the strategy for engaging with government at national, regional, and school levels.",
            "Scaling Strategy": "Detail the path to reaching target numbers, including system assets, partnerships, and resource mobilization.",
            "Technical Requirements": "Explain how the program will function without reliable internet and avoid high-tech tools.",
            "Budget and Resources": "Provide a detailed budget breakdown and resource requirements.",
            "Timeline and Milestones": "Outline the implementation timeline with specific milestones and deliverables."
        }
        
        application = {}
        missing_info = []
        
        for section, requirements in sections.items():
            print(f"Generating section: {section}")
            try:
                content = self.generate_section(section, requirements)
                application[section] = content
            except ValueError as e:
                missing_info.append(f"{section}: {str(e)}")
                application[section] = f"ERROR: {str(e)}"
            
        if missing_info:
            application["Missing Information"] = "\n".join(missing_info)
            
        return application

    def save_application(self, application, format='markdown'):
        """Save the application in the specified format."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format == 'markdown':
            # Convert to markdown
            md_content = "# D-Prize Application\n\n"
            md_content += "## Important Note\n\n"
            md_content += "This application is generated using only verified information sources. "
            md_content += "Any missing information is clearly marked and must be provided before submission.\n\n"
            
            for section, content in application.items():
                md_content += f"## {section}\n\n{content}\n\n"
            
            # Save markdown
            md_path = f"dprize_application_{timestamp}.md"
            with open(md_path, 'w') as f:
                f.write(md_content)
            
            # Convert to PDF
            pdf_path = f"dprize_application_{timestamp}.pdf"
            pdfkit.from_file(md_path, pdf_path)
            
            return md_path, pdf_path
        else:
            raise ValueError(f"Unsupported format: {format}")

def main():
    generator = DPrizeApplicationGenerator()
    
    print("Generating D-Prize application...")
    application = generator.generate_full_application()
    
    print("Saving application...")
    md_path, pdf_path = generator.save_application(application)
    
    print(f"Application saved as:\n- Markdown: {md_path}\n- PDF: {pdf_path}")
    
    # Check for missing information
    if "Missing Information" in application:
        print("\nWARNING: Missing information detected:")
        print(application["Missing Information"])

if __name__ == "__main__":
    main() 