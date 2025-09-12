'use client'

import { Spinner } from 'copilot-design-system'

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center pb-[138px] min-h-[100vh]">
      <Spinner size={10} />
    </div>
  )
}
