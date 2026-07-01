import { config } from '@n8n/node-cli/eslint';

// PNG brand asset is used intentionally — SVG version not available yet.
export default [...config, { rules: { 'n8n-nodes-base/node-class-description-icon-not-svg': 'warn' } }];
