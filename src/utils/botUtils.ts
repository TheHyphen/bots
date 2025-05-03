export function getBotPictureUrl(
  urlString: string,
  botId: number,
  apiKey: string
): string {
  const url = new URL(urlString);
  return `${url.protocol}//${url.host}/bots/${botId}/picture?apiKey=${apiKey}`;
}
