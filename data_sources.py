import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path
import hashlib
from datetime import datetime
import logging
from typing import Dict, List, Optional

# Load environment variables
load_dotenv()

class DataSource:
    def __init__(self, source_type: str, url: Optional[str] = None, file_path: Optional[str] = None):
        self.source_type = source_type
        self.url = url
        self.file_path = file_path
        self.verification_data = None
        
    def verify(self) -> Dict:
        """Verify the data source and generate verification data."""
        if self.url:
            return self._verify_url()
        elif self.file_path:
            return self._verify_file()
        else:
            raise ValueError("Either URL or file_path must be provided")
            
    def _verify_url(self) -> Dict:
        """Verify and extract data from URL."""
        try:
            response = requests.get(self.url)
            response.raise_for_status()
            
            # Generate verification data
            verification = {
                'source_type': self.source_type,
                'url': self.url,
                'hash': hashlib.sha256(response.content).hexdigest(),
                'timestamp': datetime.now().isoformat(),
                'verified': True,
                'content_type': response.headers.get('content-type', ''),
                'last_modified': response.headers.get('last-modified', '')
            }
            
            self.verification_data = verification
            return verification
            
        except Exception as e:
            logging.error(f"Error verifying URL {self.url}: {str(e)}")
            raise
            
    def _verify_file(self) -> Dict:
        """Verify and extract data from file."""
        try:
            if not os.path.exists(self.file_path):
                raise FileNotFoundError(f"File not found: {self.file_path}")
                
            with open(self.file_path, 'rb') as f:
                content = f.read()
                
            # Generate verification data
            verification = {
                'source_type': self.source_type,
                'file_path': self.file_path,
                'hash': hashlib.sha256(content).hexdigest(),
                'timestamp': datetime.now().isoformat(),
                'verified': True,
                'file_size': os.path.getsize(self.file_path),
                'last_modified': datetime.fromtimestamp(os.path.getmtime(self.file_path)).isoformat()
            }
            
            self.verification_data = verification
            return verification
            
        except Exception as e:
            logging.error(f"Error verifying file {self.file_path}: {str(e)}")
            raise
            
    def extract_content(self) -> str:
        """Extract content from the data source."""
        if not self.verification_data:
            raise ValueError("Source must be verified before extracting content")
            
        if self.url:
            return self._extract_url_content()
        else:
            return self._extract_file_content()
            
    def _extract_url_content(self) -> str:
        """Extract content from URL."""
        try:
            response = requests.get(self.url)
            response.raise_for_status()
            
            # Handle different content types
            content_type = response.headers.get('content-type', '')
            
            if 'text/html' in content_type:
                # Extract text from HTML
                soup = BeautifulSoup(response.text, 'html.parser')
                return soup.get_text(separator='\n', strip=True)
            elif 'application/json' in content_type:
                # Format JSON for readability
                return json.dumps(response.json(), indent=2)
            else:
                # Return raw text
                return response.text
                
        except Exception as e:
            logging.error(f"Error extracting content from URL {self.url}: {str(e)}")
            raise
            
    def _extract_file_content(self) -> str:
        """Extract content from file."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
                
        except Exception as e:
            logging.error(f"Error extracting content from file {self.file_path}: {str(e)}")
            raise

class DataSourceManager:
    def __init__(self):
        self.sources: Dict[str, DataSource] = {}
        self.verification_log = []
        
    def add_source(self, source_id: str, source_type: str, url: Optional[str] = None, file_path: Optional[str] = None) -> None:
        """Add a new data source."""
        source = DataSource(source_type, url, file_path)
        self.sources[source_id] = source
        
    def verify_source(self, source_id: str) -> Dict:
        """Verify a data source."""
        if source_id not in self.sources:
            raise ValueError(f"Source not found: {source_id}")
            
        source = self.sources[source_id]
        verification = source.verify()
        
        # Log verification
        self.verification_log.append({
            'source_id': source_id,
            'verification': verification,
            'timestamp': datetime.now().isoformat()
        })
        
        return verification
        
    def get_content(self, source_id: str) -> str:
        """Get content from a verified source."""
        if source_id not in self.sources:
            raise ValueError(f"Source not found: {source_id}")
            
        source = self.sources[source_id]
        return source.extract_content()
        
    def list_sources(self) -> List[Dict]:
        """List all data sources and their verification status."""
        return [
            {
                'source_id': source_id,
                'source_type': source.source_type,
                'url': source.url,
                'file_path': source.file_path,
                'verified': bool(source.verification_data)
            }
            for source_id, source in self.sources.items()
        ]
        
    def get_verification_log(self) -> List[Dict]:
        """Get the verification log."""
        return self.verification_log

def main():
    # Example usage
    manager = DataSourceManager()
    
    # Add sources
    manager.add_source(
        'org_website',
        'official_website',
        url='https://example.org'
    )
    
    manager.add_source(
        'annual_report',
        'annual_report',
        file_path='path/to/annual_report.pdf'
    )
    
    # Verify sources
    try:
        verification = manager.verify_source('org_website')
        print(f"Website verified: {verification}")
        
        content = manager.get_content('org_website')
        print(f"Website content length: {len(content)}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        
    # List sources
    print("\nData Sources:")
    for source in manager.list_sources():
        print(json.dumps(source, indent=2))

if __name__ == "__main__":
    main() 