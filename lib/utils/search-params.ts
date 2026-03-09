export type NextSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function toURLSearchParams(
  searchParamsPromise: NextSearchParams,
): Promise<URLSearchParams> {
  const searchParams = await searchParamsPromise;
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const part of value) {
        urlSearchParams.append(key, part);
      }
      continue;
    }

    if (value !== undefined) {
      urlSearchParams.set(key, value);
    }
  }

  return urlSearchParams;
}
