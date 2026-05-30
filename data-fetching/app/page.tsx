import Link from 'next/link'

export default function Page() {
  return (
    <ul>
      <li>
        <Link href="/await-promise">/await-promise</Link>
      </li>
      <li>
        <Link href="/use-promise">/use-promise</Link>
      </li>
    </ul>
  )
}
