import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
@Pipe({
  name: 'markdown',
  pure: true,
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    try {
      let parsedHTML = marked.parse(value || '');
      return parsedHTML as string;
    } catch (err) {
      return value;
    }
  }
}
