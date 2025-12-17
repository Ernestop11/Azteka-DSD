import { poParser } from '../po-engine/poParser';
import { poValidator } from '../po-engine/poValidator';

export const poEngineDebugger = {
  log(content: string) {
    const parsed = poParser.parse(content);
    const issues = poValidator.validate(parsed.items);
    console.groupCollapsed('[POEngineDebugger]');
    console.log('Supplier:', parsed.supplier);
    console.log('Items:', parsed.items);
    console.log('Issues:', issues);
    console.groupEnd();
  },
};
