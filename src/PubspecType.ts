export default interface PubspecFile {
  environment?: {
    sdk?: string
    flutter?: string
  }
  dependencies?: {
    [key: string]: string | { [key: string]: string }
  }
  dev_dependencies?: {
    [key: string]: string | { [key: string]: string }
  }
  [key: string]: unknown
}
