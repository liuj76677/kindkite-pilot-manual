export default {
  runtime: 'edge',
  regions: ['iad1'],
  async fetch(request, env) {
    return new Response('Edge Runtime');
  },
};
