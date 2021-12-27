interface Array<T> {
  filter_by(item: T): Array<T>
  filter_by_index(index: number): Array<T>
  print_all(): void
  find_rev_by_index(index: number): T | null
}
Array.prototype.filter_by = function <T>(item: T): Array<T> {
  return this.filter((it) => it === item)
}
Array.prototype.filter_by_index = function <T>(index: number): Array<T> {
  return this.filter((_, ind) => ind === index)
}
Array.prototype.print_all = function (): void {
  this.forEach((t) => console.log(t))
}
