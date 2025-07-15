declare module 'diff' {
    export interface Change {
        value: string;
        added?: boolean;
        removed?: boolean;
    }
    export function diffLines(oldStr: string, newStr: string): Change[];
}

declare module 'prismjs' {
    interface Languages {
        [language: string]: unknown;
    }
    interface Prism {
        highlight(code: string, grammar: unknown, language: string): string;
        languages: Languages;
    }
    const Prism: Prism;
    export default Prism;
} 