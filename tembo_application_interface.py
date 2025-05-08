import streamlit as st
import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import json
from pathlib import Path
from generate_dprize_application import DPrizeApplicationGenerator
import markdown
import pdfkit
from datetime import datetime
from data_sources import DataSourceManager

# Load environment variables
load_dotenv()

# Initialize OpenAI and Pinecone clients
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index('dprize-connect-ed')

# Initialize data source manager
data_manager = DataSourceManager()

def load_application_template():
    """Load the application template."""
    try:
        with open('tembo_application_template.md', 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "Application template not found."

def search_relevant_sources(query):
    """Search for relevant information in Pinecone."""
    try:
        # Generate embedding for the query
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        query_embedding = response.data[0].embedding

        # Search in Pinecone
        results = index.query(
            vector=query_embedding,
            top_k=5,
            include_metadata=True
        )

        return results.matches
    except Exception as e:
        st.error(f"Error searching sources: {str(e)}")
        return []

def main():
    st.set_page_config(page_title="Tembo Education D-Prize Application", layout="wide")
    
    st.title("Tembo Education D-Prize Application Portal")
    
    # Sidebar navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Go to", ["Application Draft", "Review & Edit", "Next Steps", "Generate Application", "Data Sources"])
    
    if page == "Application Draft":
        st.header("Application Draft")
        
        # Load and display template
        template = load_application_template()
        st.markdown(template)
        
        # Section selection for source viewing
        st.subheader("View Sources")
        section = st.selectbox(
            "Select section to view sources",
            ["Organization Overview", "Implementation Model", "Budget and Resources", "Team and Experience", "Monitoring and Evaluation"]
        )
        
        if st.button("Search Sources"):
            sources = search_relevant_sources(section)
            if sources:
                st.subheader("Relevant Sources")
                for source in sources:
                    with st.expander(f"Source: {source.metadata.get('source', 'Unknown')}"):
                        st.write(source.metadata.get('text', 'No content available'))
            else:
                st.info("No relevant sources found for this section.")
                
    elif page == "Review & Edit":
        st.header("Review & Edit")
        
        # Internal review
        st.subheader("Internal Review")
        internal_review = st.checkbox("Internal review completed")
        if internal_review:
            st.text_area("Internal review comments", height=200)
            
        # External review
        st.subheader("External Review")
        external_review = st.checkbox("External review completed")
        if external_review:
            st.text_area("External review comments", height=200)
            
        # Comments
        st.subheader("Comments")
        st.text_area("Add your comments", height=200)
        
    elif page == "Next Steps":
        st.header("Next Steps")
        
        # Timeline
        st.subheader("Timeline")
        st.markdown("""
        ### Immediate Actions (1-2 weeks)
        - Finalize application draft
        - Complete internal review
        - Gather supporting documents
        
        ### Short-term Tasks (2-4 weeks)
        - External review process
        - Budget refinement
        - Team preparation
        
        ### Medium-term Goals (1-3 months)
        - Implementation planning
        - Resource allocation
        - Partnership development
        
        ### Long-term Planning (3-6 months)
        - Scaling strategy
        - Impact measurement
        - Sustainability planning
        """)
        
    elif page == "Generate Application":
        st.header("Generate Application")
        
        if st.button("Generate D-Prize Application"):
            try:
                # Generate application
                from generate_dprize_application import DPrizeApplicationGenerator
                generator = DPrizeApplicationGenerator()
                application = generator.generate_full_application()
                
                # Save application
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                markdown_path = f"tembo_dprize_application_{timestamp}.md"
                pdf_path = f"tembo_dprize_application_{timestamp}.pdf"
                
                generator.save_application(application, markdown_path, pdf_path)
                
                # Display success message
                st.success("Application generated successfully!")
                
                # Provide download links
                with open(markdown_path, 'r') as f:
                    st.download_button(
                        label="Download Markdown",
                        data=f.read(),
                        file_name=markdown_path,
                        mime="text/markdown"
                    )
                    
                with open(pdf_path, 'rb') as f:
                    st.download_button(
                        label="Download PDF",
                        data=f.read(),
                        file_name=pdf_path,
                        mime="application/pdf"
                    )
                    
            except Exception as e:
                st.error(f"Error generating application: {str(e)}")
                
    elif page == "Data Sources":
        st.header("Data Sources")
        
        # Add new source
        st.subheader("Add New Source")
        source_type = st.selectbox(
            "Source Type",
            ["official_website", "annual_report", "news_article", "social_media", "other"]
        )
        
        source_url = st.text_input("Source URL (optional)")
        source_file = st.file_uploader("Upload File (optional)", type=['pdf', 'txt', 'doc', 'docx'])
        
        if st.button("Add Source"):
            try:
                # Save uploaded file if provided
                file_path = None
                if source_file:
                    file_path = f"uploads/{source_file.name}"
                    os.makedirs("uploads", exist_ok=True)
                    with open(file_path, "wb") as f:
                        f.write(source_file.getvalue())
                
                # Add source to manager
                source_id = f"{source_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                data_manager.add_source(source_id, source_type, source_url, file_path)
                
                # Verify source
                verification = data_manager.verify_source(source_id)
                
                st.success(f"Source added and verified: {source_id}")
                st.json(verification)
                
            except Exception as e:
                st.error(f"Error adding source: {str(e)}")
        
        # List sources
        st.subheader("Current Sources")
        sources = data_manager.list_sources()
        for source in sources:
            with st.expander(f"Source: {source['source_id']}"):
                st.json(source)
                
                if source['verified']:
                    if st.button(f"View Content", key=source['source_id']):
                        try:
                            content = data_manager.get_content(source['source_id'])
                            st.text_area("Content", content, height=200)
                        except Exception as e:
                            st.error(f"Error viewing content: {str(e)}")
                            
                if st.button(f"Process to Pinecone", key=f"process_{source['source_id']}"):
                    try:
                        from process_dprize import DPrizeProcessor
                        processor = DPrizeProcessor()
                        content = data_manager.get_content(source['source_id'])
                        processor.process_text(content, source['source_type'])
                        st.success("Source processed and added to Pinecone")
                    except Exception as e:
                        st.error(f"Error processing source: {str(e)}")

if __name__ == "__main__":
    main() 