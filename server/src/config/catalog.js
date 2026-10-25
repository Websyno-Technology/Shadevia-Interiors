const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../../../config/catalog.yml');
const source = fs.readFileSync(catalogPath, 'utf8');
const categoriesSection = source.match(/categories:\s*([\s\S]*?)\n\s*tags:/)?.[1] || '';
const tagsSection = source.match(/tags:\s*([\s\S]*)$/)?.[1] || '';

const categories = Array.from(categoriesSection.matchAll(/-\s+id:\s*([^\r\n]+)\s*[\r\n]+\s*label:\s*([^\r\n]+)/g), ([, id, label]) => ({ id: id.trim(), label: label.trim() }));
const tags = Array.from(tagsSection.matchAll(/-\s+([^\r\n]+)/g), ([, tag]) => tag.trim());
const categoryIds = categories.map((category) => category.id);
const categoryIdSet = new Set(categoryIds);
const tagNames = new Set(tags);

module.exports = { categories, categoryIds, tags, isAllowedCategory: (category) => categoryIdSet.has(category), areAllowedTags: (values) => values.every((tag) => tagNames.has(tag)) };
