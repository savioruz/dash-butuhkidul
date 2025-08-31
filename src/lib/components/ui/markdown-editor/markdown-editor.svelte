<script lang="ts">
	import { Carta, MarkdownEditor } from 'carta-md';
	import { code } from '@cartamd/plugin-code';
	import { anchor } from '@cartamd/plugin-anchor';

	import 'carta-md/default.css';
	import '@cartamd/plugin-code/default.css';
	import './markdown-editor.scss';

	interface Props {
		value?: string;
		placeholder?: string;
		label?: string;
		rows?: number;
		required?: boolean;
		id?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Write your content here... Supports Markdown!',
		label = 'Content',
		rows = 8,
		required = false,
		id = 'markdown-editor'
	}: Props = $props();

	const carta = new Carta({
		sanitizer: false,
		extensions: [code(), anchor()]
	});

	function insertSample() {
		value = `# Your Article Title

Welcome to your **new article**! This editor supports *GitHub Flavored Markdown*.

## Features

- **Bold text** with \`**bold**\`
- *Italic text* with \`*italic*\`
- \`Inline code\` with backticks
- [Links](https://example.com) with \`[text](url)\`

### Lists

Unordered lists:
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

Ordered lists:
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

### Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

---

Happy writing! 🎉`;
	}
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label
			for={id}
			class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
			{required ? '*' : ''}
		</label>
		{#if !value.trim()}
			<button
				type="button"
				class="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				onclick={insertSample}
			>
				Insert Sample
			</button>
		{/if}
	</div>

	<div style="min-height: {rows * 1.5}rem;" class="carta-wrapper">
		<MarkdownEditor bind:value mode="tabs" theme="github" {carta} {placeholder} />
	</div>
</div>
