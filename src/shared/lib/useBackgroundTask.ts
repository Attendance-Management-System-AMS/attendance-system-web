import { toast } from 'vue-sonner'

type StartContext<Draft, Payload> = {
  draft: Draft
  payload: Payload
}

type SuccessContext<Draft, Payload, Result> = StartContext<Draft, Payload> & {
  result: Result
}

type ErrorContext<Draft, Payload> = StartContext<Draft, Payload> & {
  error: unknown
  message?: string
}

type StartMessage<Draft, Payload> =
  | string
  | ((context: StartContext<Draft, Payload>) => string | undefined)

type SuccessMessage<Draft, Payload, Result> =
  | string
  | ((context: SuccessContext<Draft, Payload, Result>) => string | undefined)

type ErrorMessage<Draft, Payload> =
  | string
  | ((context: ErrorContext<Draft, Payload>) => string | undefined)

export interface ExecuteBackgroundTaskOptions<Draft, Payload, Result> {
  draft: Draft
  payload: Payload
  run: (payload: Payload) => Promise<Result>
  pendingMessage?: StartMessage<Draft, Payload>
  successMessage?: SuccessMessage<Draft, Payload, Result>
  errorMessage?: ErrorMessage<Draft, Payload>
  onStart?: (context: StartContext<Draft, Payload>) => void
  onSuccess?: (context: SuccessContext<Draft, Payload, Result>) => void
  onError?: (context: ErrorContext<Draft, Payload>) => void
}

function resolveMessage<Context>(
  message: string | ((context: Context) => string | undefined) | undefined,
  context: Context,
) {
  if (typeof message === 'function') {
    return message(context)
  }

  return message
}

export function useBackgroundTask() {
  const executeBackgroundTask = async <Draft, Payload, Result>(
    options: ExecuteBackgroundTaskOptions<Draft, Payload, Result>,
  ) => {
    const { draft, payload, run, pendingMessage, successMessage, errorMessage, onStart, onSuccess, onError } =
      options
    const startContext = { draft, payload }

    onStart?.(startContext)

    const nextPendingMessage = resolveMessage(pendingMessage, startContext)
    if (nextPendingMessage) {
      toast.message(nextPendingMessage)
    }

    try {
      const result = await run(payload)
      const successContext = { ...startContext, result }

      onSuccess?.(successContext)

      const nextSuccessMessage = resolveMessage(successMessage, successContext)
      if (nextSuccessMessage) {
        toast.success(nextSuccessMessage)
      }

      return result
    } catch (error) {
      const errorContext = {
        ...startContext,
        error,
        message: resolveMessage(errorMessage, { ...startContext, error }),
      }

      onError?.(errorContext)

      if (errorContext.message) {
        toast.error(errorContext.message)
      }

      return undefined
    }
  }

  return {
    executeBackgroundTask,
  }
}
