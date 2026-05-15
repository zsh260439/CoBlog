import { MaybeRefOrGetter } from 'vue'

export interface StructuredDataNode {
  [key: string]: string | number | boolean | null | string[] | StructuredDataNode | StructuredDataNode[]
}
export interface SeoOptions {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string>
  type?: MaybeRefOrGetter<string>
  robots?: MaybeRefOrGetter<string>
  structuredData?: MaybeRefOrGetter<StructuredDataNode | StructuredDataNode[] | null | undefined>
}
