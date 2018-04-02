export class List<T> implements Iterable<T> {
    private items: T[];

    constructor(items?: T[]) {
        this.items = items || [];
    }

    public contains(item: T): boolean {
        return this.items.filter((v) => v === item).length > 0;
    }

    public where(selector: (value: T, index?: number) => boolean): List<T> {
        return new List(this.items.filter(selector));
    }

    public select<TReturn>(selector: (value: T, index: number) => TReturn): List<TReturn> {
        return new List(this.items.map(selector));
    }

    public selectMany<TReturn>(selector: (value: T, index: number) => List<TReturn>): List<TReturn> {
        return this.items.map(selector).reduce((p, c) => p.concat(c), new List<TReturn>());
    }

    public take(amount: number): List<T> {
        return new List(this.items.slice(0, amount + 1));
    }

    public concat(items: List<T>): List<T> {
        return new List(this.items.concat(items.array));
    }

    public append(item: T): List<T> {
        return new List([...this.items, item]);
    }

    public distinct(): List<T> {
        return this.where((v, i) => this.items.indexOf(v) === i);
    }

    public get length(): number {
        return this.items.length;
    }

    public get array(): T[] {
        return [...this.items];
    }

    public [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }
}
