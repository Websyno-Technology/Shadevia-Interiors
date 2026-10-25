import source from '../../../config/catalog.yml?raw';

const categoriesSection = source.match(/categories:\s*([\s\S]*?)\n\s*tags:/)?.[1] || '';
const tagsSection = source.match(/tags:\s*([\s\S]*)$/)?.[1] || '';

export const categories = Array.from(categoriesSection.matchAll(/-\s+id:\s*([^\r\n]+)\s*[\r\n]+\s*label:\s*([^\r\n]+)/g), ([, id, label]) => ({ id: id.trim(), label: label.trim() }));
export const tags = Array.from(tagsSection.matchAll(/-\s+([^\r\n]+)/g), ([, tag]) => tag.trim());
