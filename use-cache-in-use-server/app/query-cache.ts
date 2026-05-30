'use cache'

// Same getData/getKey, but file-level "use cache" instead of "use server".
export async function getData(repo: string) {
  const url = await getKey(repo)
  return {
    repo,
    url,
    cachedAt: new Date().toISOString(),
  }
}

export async function getKey(repo: string) {
  return `/api/repos/${repo}`
}
