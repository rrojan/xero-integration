'use client'

import { Spinner } from 'copilot-design-system'

export const Loader = () => {
  return (
    // biome-ignore lint/a11y/useSemanticElements: output tag is not semantic here
    <div role="status" className="flex flex-col items-center justify-center pb-[138px] h-full">
      <Spinner size={10} />
    </div>
  )
}
