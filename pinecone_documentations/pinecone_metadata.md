# Pinecone Database

Pinecone is the leading vector database for building accurate and performant AI applications at scale in production.

<CardGroup cols={2}>
  <Card title="Database quickstart" icon="database" href="/guides/get-started/quickstart">
    Set up a fully managed vector database for high-performance semantic search
  </Card>

  <Card title="Assistant quickstart" icon="comments" href="/guides/assistant/quickstart">
    Create an AI assistant that answers complex questions about your proprietary data
  </Card>
</CardGroup>

## Inference

Leading embedding and reranking models hosted by Pinecone. [Explore all models](/models).

<CardGroup cols={3}>
  <Card title="llama-text-embed" titleSize="p" href="/models/llama-text-embed-v2" horizontal>
    State of the art model 1B text embedding model
  </Card>

  <Card title="cohere-rerank-3.5" titleSize="p" href="/models/cohere-rerank-3.5" horizontal>
    State of the art reranking model for search
  </Card>

  <Card title="pinecone-sparse-v0" titleSize="p" href="/models/pinecone-sparse-english-v0" horizontal>
    Sparse vector model for keyword-style search
  </Card>
</CardGroup>

## Database workflows

<Tabs>
  <Tab title="Integrated embedding">
    Use integrated embedding to upsert and search with text and have Pinecone generate vectors automatically.

    <Steps>
      <Step title="Create an index">
        [Create an index](/guides/index-data/create-an-index) that is integrated with one of Pinecone's [hosted embedding models](/guides/index-data/create-an-index#embedding-models). Dense indexes and vectors enable semantic search, while sparse indexes and vectors enable lexical search.
      </Step>

      <Step title="Upsert text">
        [Upsert](/guides/index-data/upsert-data) your source text and have Pinecone convert the text to vectors automatically. [Use namespaces to partition data](/guides/index-data/indexing-overview#namespaces) for faster queries and multitenant isolation between customers.
      </Step>

      <Step title="Search with text">
        [Search](/guides/search/search-overview) the index with a query text. Again, Pinecone uses the index's integrated model to convert the text to a vector automatically.
      </Step>

      <Step title="Improve relevance">
        [Filter by metadata](/guides/search/filter-by-metadata) to limit the scope of your search, [rerank results](/guides/search/rerank-results) to increase search accuracy, or add [lexical search](/guides/search/lexical-search) to capture both semantic understanding and precise keyword matches.
      </Step>
    </Steps>
  </Tab>

  <Tab title="Bring your own vectors">
    If you use an external embedding model to generate vectors, you can upsert and search with vectors directly.

    <Steps>
      <Step title="Generate vectors">
        Use an external embedding model to convert data into dense or sparse vectors.
      </Step>

      <Step title="Create an index">
        [Create an index](/guides/index-data/create-an-index) that matches the characteristics of your embedding model. Dense indexes and vectors enable semantic search, while sparse indexes and vectors enable lexical search.
      </Step>

      <Step title="Ingest vectors">
        [Load your vectors](/guides/index-data/data-ingestion-overview) and metadata into your index using Pinecone's import or upsert feature. [Use namespaces to partition data](/guides/index-data/indexing-overview#namespaces) for faster queries and multitenant isolation between customers.
      </Step>

      <Step title="Search with a vector">
        Use an external embedding model to convert a query text to a vector and [search](/guides/search/search-overview) the index with the vector.
      </Step>

      <Step title="Improve relevance">
        [Filter by metadata](/guides/search/filter-by-metadata) to limit the scope of your search, [rerank results](/guides/search/rerank-results) to increase search accuracy, or add [lexical search](/guides/search/lexical-search) to capture both semantic understanding and precise keyword matches.
      </Step>
    </Steps>
  </Tab>
</Tabs>

## Start building

<CardGroup cols={3}>
  <Card title="API Reference" icon="code-simple" href="/reference">
    Comprehensive details about the Pinecone APIs, SDKs, utilities, and architecture.
  </Card>

  <Card title="Integrated Inference" icon="cubes" href="/guides/index-data/indexing-overview#integrated-embedding">
    Simplify vector search with integrated embedding & reranking.
  </Card>

  <Card title="Examples" icon="grid-round" iconType="solid" href="/examples">
    Hands-on notebooks and sample apps with common AI patterns and tools.
  </Card>

  <Card title="Integrations" icon="link-simple" href="/integrations">
    Pinecone's growing number of third-party integrations.
  </Card>

  <Card title="Troubleshooting" icon="bug" href="/troubleshooting/contact-support">
    Resolve common Pinecone issues with our troubleshooting guide.
  </Card>

  <Card title="Releases" icon="party-horn" href="/release-notes">
    News about features and changes in Pinecone and related tools.
  </Card>
</CardGroup>