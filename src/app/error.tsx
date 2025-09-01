'use client'

import { Button } from 'copilot-design-system'
import Linkify from 'react-linkify'

export default function ClientErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)

  return (
    <main>
      <div className="flex flex-col justify-center items-center pb-4 pt-52">
        <p className="mb-2 [&>a:hover]:underline [&>a]:block">
          <Linkify
            componentDecorator={(decoratedHref, decoratedText, key) => (
              <a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key}>
                {decoratedText}
              </a>
            )}
          >
            {error.message}.
          </Linkify>
        </p>
        <Button label="Try again" onClick={() => reset()} />
      </div>
    </main>
  )
}
