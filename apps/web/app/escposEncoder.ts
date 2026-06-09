export class EscposEncoder {
  private buffer: number[] = [];
  private encoder = new TextEncoder();

  init() {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  align(alignment: 'left' | 'center' | 'right') {
    const code = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(0x1b, 0x61, code);
    return this;
  }

  bold(on: boolean) {
    this.buffer.push(0x1b, 0x45, on ? 1 : 0);
    return this;
  }

  size(double: boolean) {
    this.buffer.push(0x1d, 0x21, double ? 0x11 : 0x00);
    return this;
  }

  text(str: string) {
    const bytes = this.encoder.encode(str);
    this.buffer.push(...Array.from(bytes));
    return this;
  }

  line(str: string = '') {
    this.text(str + '\n');
    return this;
  }

  feed(lines: number = 1) {
    this.buffer.push(0x1b, 0x64, lines);
    return this;
  }

  cut() {
    this.buffer.push(0x1d, 0x56, 0x42, 0x00);
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}
