export const VERSION = '0.1.2';

/** `prepublish` will be invoked before publish, return `false` to prevent the publish */
export async function prepublish(version: string) {
  console.log('on prepublish', version)
}

/** `postpublish` will be invoked after published */
export async function postpublish(version: string) {
  console.log('on postpublish', version)
}