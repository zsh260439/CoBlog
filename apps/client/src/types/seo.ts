export interface StructuredDataNode {
  [key: string]: string | number | boolean | null | string[] | StructuredDataNode | StructuredDataNode[]
}
