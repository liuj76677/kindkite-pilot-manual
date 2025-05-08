import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import tiktoken
from tenacity import retry, stop_after_attempt, wait_exponential
import json
from pathlib import Path
import hashlib
from datetime import datetime

# Load environment variables
load_dotenv()

class DPrizeProcessor:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
        self.index_name = 'dprize-connect-ed'
        self.namespace = 'dprize'
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
    def initialize_index(self):
        """Initialize or connect to Pinecone index."""
        try:
            # Check if index exists
            existing_indexes = self.pc.list_indexes()
            if self.index_name not in existing_indexes.names():
                # Create new index
                self.pc.create_index(
                    name=self.index_name,
                    dimension=1536,  # OpenAI embedding dimension
                    metric='cosine'
                )
            return self.pc.Index(self.index_name)
        except Exception as e:
            print(f"Error initializing index: {e}")
            raise

    def verify_source(self, source_path):
        """Verify the source of information."""
        if not os.path.exists(source_path):
            raise ValueError(f"Source file not found: {source_path}")
            
        # Generate hash for verification
        with open(source_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
            
        return {
            'file_path': source_path,
            'hash': file_hash,
            'timestamp': datetime.now().isoformat(),
            'verified': True
        }

    def chunk_text(self, text, chunk_size=1000, overlap=200):
        """Split text into overlapping chunks."""
        tokens = self.encoding.encode(text)
        chunks = []
        
        for i in range(0, len(tokens), chunk_size - overlap):
            chunk = tokens[i:i + chunk_size]
            chunks.append(self.encoding.decode(chunk))
            
        return chunks

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def get_embedding(self, text):
        """Get embedding for text with retry logic."""
        try:
            response = self.client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            raise

    def process_text(self, text, metadata=None, source_verification=None):
        """Process text into chunks and create embeddings."""
        if not source_verification or not source_verification.get('verified'):
            raise ValueError("Source must be verified before processing")
            
        chunks = self.chunk_text(text)
        vectors = []
        
        for i, chunk in enumerate(chunks):
            embedding = self.get_embedding(chunk)
            vector = {
                'id': f'chunk_{i}',
                'values': embedding,
                'metadata': {
                    'text': chunk,
                    'chunk_index': i,
                    'source': metadata.get('source', 'unknown'),
                    'section': metadata.get('section', 'general'),
                    'timestamp': metadata.get('timestamp', ''),
                    'source_verification': source_verification,
                    **(metadata or {})
                }
            }
            vectors.append(vector)
            
        return vectors

    def upsert_vectors(self, vectors, batch_size=50):
        """Upsert vectors to Pinecone in batches."""
        index = self.initialize_index()
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            try:
                index.upsert(vectors=batch, namespace=self.namespace)
                print(f"Upserted batch {i//batch_size + 1}")
            except Exception as e:
                print(f"Error upserting batch {i//batch_size + 1}: {e}")
                raise

    def process_dprize_requirements(self):
        """Process D-Prize requirements and guidelines."""
        source_path = 'dprize_text.txt'
        source_verification = self.verify_source(source_path)
        
        # Read D-Prize text
        with open(source_path, 'r') as f:
            text = f.read()
            
        # Process with metadata
        metadata = {
            'source': 'dprize_requirements',
            'section': 'guidelines',
            'timestamp': datetime.now().isoformat()
        }
        
        vectors = self.process_text(text, metadata, source_verification)
        self.upsert_vectors(vectors)
        
    def process_organization_info(self, source_path, metadata):
        """Process organization information from verified source."""
        source_verification = self.verify_source(source_path)
        
        # Read organization info
        with open(source_path, 'r') as f:
            text = f.read()
            
        vectors = self.process_text(text, metadata, source_verification)
        self.upsert_vectors(vectors)

def main():
    processor = DPrizeProcessor()
    
    # Process D-Prize requirements
    print("Processing D-Prize requirements...")
    processor.process_dprize_requirements()
    
    # Note: Organization information must be provided and verified
    print("\nTo process organization information, please provide:")
    print("1. Source file path")
    print("2. Source type (e.g., 'official_website', 'annual_report', 'government_registry')")
    print("3. Section/category of information")
    print("\nExample command:")
    print("python process_dprize.py --org_info path/to/source.txt --source_type official_website --section organization_overview")

if __name__ == "__main__":
    main() 