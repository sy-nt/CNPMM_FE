import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import {
  createDeliveryMethod,
  createDeliveryRate,
  createDeliveryZone,
  deleteDeliveryMethod,
  deleteDeliveryRate,
  deleteDeliveryZone,
  listDeliveryRates,
  listDeliveryZones,
  updateDeliveryMethod,
  updateDeliveryRate,
  updateDeliveryZone,
} from '#/lib/api/delivery'
import { formatPrice } from '#/lib/format'
import { DELIVERY_PERMISSIONS } from '#/lib/rbac/constants'
import { deliveryMethodsQueryOptions } from '#/lib/query/delivery'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const DELIVERY_ZONES_QUERY_KEY = ['delivery', 'zones'] as const
const DELIVERY_RATES_QUERY_KEY = ['delivery', 'rates'] as const
const DELIVERY_METHODS_QUERY_KEY = ['delivery'] as const

type MethodFormState = {
  code: string
  name: string
  description: string
  etaMinDays: string
  etaMaxDays: string
}

type ZoneFormState = {
  code: string
  name: string
  description: string
}

type RateFormState = {
  deliveryMethodId: string
  deliveryZoneId: string
  baseFee: string
}

const INITIAL_METHOD_STATE: MethodFormState = {
  code: '',
  name: '',
  description: '',
  etaMinDays: '1',
  etaMaxDays: '3',
}

const INITIAL_ZONE_STATE: ZoneFormState = {
  code: '',
  name: '',
  description: '',
}

const INITIAL_RATE_STATE: RateFormState = {
  deliveryMethodId: '',
  deliveryZoneId: '',
  baseFee: '',
}

const RATE_LIST_QUERY = { page: 1, limit: 50, orderBy: 'createdAt' as const, sort: 'desc' as const }

export function DeliveryConfigPage(): ReactNode {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [methodState, setMethodState] = useState<MethodFormState>(INITIAL_METHOD_STATE)
  const [zoneState, setZoneState] = useState<ZoneFormState>(INITIAL_ZONE_STATE)
  const [rateState, setRateState] = useState<RateFormState>(INITIAL_RATE_STATE)

  const methodsQuery = useQuery(deliveryMethodsQueryOptions(accessToken))
  const zonesQuery = useQuery({
    queryKey: [...DELIVERY_ZONES_QUERY_KEY, accessToken],
    queryFn: ({ signal }) => listDeliveryZones(accessToken, signal),
  })
  const ratesQuery = useQuery({
    queryKey: [...DELIVERY_RATES_QUERY_KEY, accessToken],
    queryFn: ({ signal }) => listDeliveryRates(accessToken, RATE_LIST_QUERY, signal),
  })

  const createMethodMutation = useMutation({
    mutationFn: (input: Parameters<typeof createDeliveryMethod>[1]) =>
      createDeliveryMethod(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_METHODS_QUERY_KEY })
    },
  })
  const updateMethodMutation = useMutation({
    mutationFn: ({
      methodId,
      input,
    }: {
      methodId: string
      input: Parameters<typeof updateDeliveryMethod>[2]
    }) => updateDeliveryMethod(accessToken, methodId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_METHODS_QUERY_KEY })
    },
  })
  const deleteMethodMutation = useMutation({
    mutationFn: (methodId: string) => deleteDeliveryMethod(accessToken, methodId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_METHODS_QUERY_KEY })
    },
  })

  const createZoneMutation = useMutation({
    mutationFn: (input: Parameters<typeof createDeliveryZone>[1]) =>
      createDeliveryZone(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_ZONES_QUERY_KEY })
    },
  })
  const updateZoneMutation = useMutation({
    mutationFn: ({
      zoneId,
      input,
    }: {
      zoneId: string
      input: Parameters<typeof updateDeliveryZone>[2]
    }) => updateDeliveryZone(accessToken, zoneId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_ZONES_QUERY_KEY })
    },
  })
  const deleteZoneMutation = useMutation({
    mutationFn: (zoneId: string) => deleteDeliveryZone(accessToken, zoneId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_ZONES_QUERY_KEY })
    },
  })

  const createRateMutation = useMutation({
    mutationFn: (input: Parameters<typeof createDeliveryRate>[1]) =>
      createDeliveryRate(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_RATES_QUERY_KEY })
    },
  })
  const updateRateMutation = useMutation({
    mutationFn: ({
      rateId,
      input,
    }: {
      rateId: string
      input: Parameters<typeof updateDeliveryRate>[2]
    }) => updateDeliveryRate(accessToken, rateId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_RATES_QUERY_KEY })
    },
  })
  const deleteRateMutation = useMutation({
    mutationFn: (rateId: string) => deleteDeliveryRate(accessToken, rateId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DELIVERY_RATES_QUERY_KEY })
    },
  })

  const handleCreateMethod = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (createMethodMutation.isPending) return
    try {
      await createMethodMutation.mutateAsync({
        code: methodState.code.trim(),
        name: methodState.name.trim(),
        description: methodState.description.trim() || undefined,
        etaMinDays: Number(methodState.etaMinDays),
        etaMaxDays: Number(methodState.etaMaxDays),
        isActive: true,
      })
      setMethodState(INITIAL_METHOD_STATE)
      toast.success('Delivery method created.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not create delivery method.'))
    }
  }

  const handleCreateZone = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (createZoneMutation.isPending) return
    try {
      await createZoneMutation.mutateAsync({
        code: zoneState.code.trim(),
        name: zoneState.name.trim(),
        description: zoneState.description.trim() || undefined,
        isActive: true,
      })
      setZoneState(INITIAL_ZONE_STATE)
      toast.success('Delivery zone created.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not create delivery zone.'))
    }
  }

  const handleCreateRate = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (createRateMutation.isPending) return
    try {
      await createRateMutation.mutateAsync({
        deliveryMethodId: rateState.deliveryMethodId,
        deliveryZoneId: rateState.deliveryZoneId,
        baseFee: rateState.baseFee.trim(),
      })
      setRateState(INITIAL_RATE_STATE)
      toast.success('Delivery rate created.')
    } catch (error) {
      toast.error(_humanizeError(error, 'Could not create delivery rate.'))
    }
  }

  return (
    <div className="space-y-8">
      <ManageSection
        title="Delivery methods"
        description="Manage carriers and expected delivery windows."
      >
        <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_METHOD_CREATE]}>
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateMethod}>
                <Input
                  placeholder="Code"
                  value={methodState.code}
                  onChange={(event) =>
                    setMethodState((prev) => ({ ...prev, code: event.target.value }))
                  }
                />
                <Input
                  placeholder="Name"
                  value={methodState.name}
                  onChange={(event) =>
                    setMethodState((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <Input
                  placeholder="ETA min days"
                  type="number"
                  min={0}
                  value={methodState.etaMinDays}
                  onChange={(event) =>
                    setMethodState((prev) => ({ ...prev, etaMinDays: event.target.value }))
                  }
                />
                <Input
                  placeholder="ETA max days"
                  type="number"
                  min={0}
                  value={methodState.etaMaxDays}
                  onChange={(event) =>
                    setMethodState((prev) => ({ ...prev, etaMaxDays: event.target.value }))
                  }
                />
                <div className="md:col-span-2">
                  <Input
                    placeholder="Description"
                    value={methodState.description}
                    onChange={(event) =>
                      setMethodState((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={createMethodMutation.isPending}>
                    {createMethodMutation.isPending ? 'Creating…' : 'Create method'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </RequirePermission>

        <ManageAsyncState
          isLoading={methodsQuery.isLoading}
          isError={methodsQuery.isError}
          isEmpty={(methodsQuery.data?.length ?? 0) === 0}
          emptyTitle="No delivery methods"
          emptyDescription="Create methods before configuring delivery rates."
        >
          <div className="grid gap-3">
            {methodsQuery.data?.map((method) => (
              <Card key={method.id}>
                <CardHeader>
                  <CardTitle className="text-base">{method.name}</CardTitle>
                  <CardDescription>
                    {method.code} - ETA {method.etaMinDays} to {method.etaMaxDays} day(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_METHOD_UPDATE]}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateMethodMutation.isPending}
                      onClick={() =>
                        void updateMethodMutation
                          .mutateAsync({
                            methodId: method.id,
                            input: { isActive: !method.isActive },
                          })
                          .then(() => toast.success('Delivery method updated.'))
                          .catch((error: unknown) =>
                            toast.error(
                              _humanizeError(error, 'Could not update delivery method.'),
                            ),
                          )
                      }
                    >
                      {method.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </RequirePermission>
                  <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_METHOD_DELETE]}>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteMethodMutation.isPending}
                      onClick={() =>
                        void deleteMethodMutation
                          .mutateAsync(method.id)
                          .then(() => toast.success('Delivery method deleted.'))
                          .catch((error: unknown) =>
                            toast.error(
                              _humanizeError(error, 'Could not delete delivery method.'),
                            ),
                          )
                      }
                    >
                      Delete
                    </Button>
                  </RequirePermission>
                </CardContent>
              </Card>
            ))}
          </div>
        </ManageAsyncState>
      </ManageSection>

      <ManageSection
        title="Delivery zones"
        description="Define delivery regions used by rate rules."
      >
        <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_ZONE_CREATE]}>
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateZone}>
                <Input
                  placeholder="Code"
                  value={zoneState.code}
                  onChange={(event) =>
                    setZoneState((prev) => ({ ...prev, code: event.target.value }))
                  }
                />
                <Input
                  placeholder="Name"
                  value={zoneState.name}
                  onChange={(event) =>
                    setZoneState((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <div className="md:col-span-2">
                  <Input
                    placeholder="Description"
                    value={zoneState.description}
                    onChange={(event) =>
                      setZoneState((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={createZoneMutation.isPending}>
                    {createZoneMutation.isPending ? 'Creating…' : 'Create zone'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </RequirePermission>

        <ManageAsyncState
          isLoading={zonesQuery.isLoading}
          isError={zonesQuery.isError}
          isEmpty={(zonesQuery.data?.length ?? 0) === 0}
          emptyTitle="No delivery zones"
          emptyDescription="Create zones before assigning delivery rates."
        >
          <div className="grid gap-3">
            {zonesQuery.data?.map((zone) => (
              <Card key={zone.id}>
                <CardHeader>
                  <CardTitle className="text-base">{zone.name}</CardTitle>
                  <CardDescription>{zone.code}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_ZONE_UPDATE]}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateZoneMutation.isPending}
                      onClick={() =>
                        void updateZoneMutation
                          .mutateAsync({
                            zoneId: zone.id,
                            input: { isActive: !zone.isActive },
                          })
                          .then(() => toast.success('Delivery zone updated.'))
                          .catch((error: unknown) =>
                            toast.error(
                              _humanizeError(error, 'Could not update delivery zone.'),
                            ),
                          )
                      }
                    >
                      {zone.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </RequirePermission>
                  <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_ZONE_DELETE]}>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteZoneMutation.isPending}
                      onClick={() =>
                        void deleteZoneMutation
                          .mutateAsync(zone.id)
                          .then(() => toast.success('Delivery zone deleted.'))
                          .catch((error: unknown) =>
                            toast.error(
                              _humanizeError(error, 'Could not delete delivery zone.'),
                            ),
                          )
                      }
                    >
                      Delete
                    </Button>
                  </RequirePermission>
                </CardContent>
              </Card>
            ))}
          </div>
        </ManageAsyncState>
      </ManageSection>

      <ManageSection
        title="Delivery rates"
        description="Set base fees per method-zone combination."
      >
        <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_RATE_CREATE]}>
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-3 md:grid-cols-3" onSubmit={handleCreateRate}>
                <div className="grid gap-2">
                  <Label htmlFor="rate-method">Method</Label>
                  <select
                    id="rate-method"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={rateState.deliveryMethodId}
                    onChange={(event) =>
                      setRateState((prev) => ({
                        ...prev,
                        deliveryMethodId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select method</option>
                    {methodsQuery.data?.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate-zone">Zone</Label>
                  <select
                    id="rate-zone"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={rateState.deliveryZoneId}
                    onChange={(event) =>
                      setRateState((prev) => ({
                        ...prev,
                        deliveryZoneId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select zone</option>
                    {zonesQuery.data?.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Base fee"
                  value={rateState.baseFee}
                  onChange={(event) =>
                    setRateState((prev) => ({
                      ...prev,
                      baseFee: event.target.value,
                    }))
                  }
                />
                <div className="md:col-span-3">
                  <Button type="submit" disabled={createRateMutation.isPending}>
                    {createRateMutation.isPending ? 'Creating…' : 'Create rate'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </RequirePermission>

        <ManageAsyncState
          isLoading={ratesQuery.isLoading}
          isError={ratesQuery.isError}
          isEmpty={(ratesQuery.data?.items.length ?? 0) === 0}
          emptyTitle="No delivery rates"
          emptyDescription="Create rates to complete delivery configuration."
        >
          <div className="grid gap-3">
            {ratesQuery.data?.items.map((rate) => (
              <Card key={rate.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {formatPrice(rate.baseFee) ?? rate.baseFee}
                  </CardTitle>
                  <CardDescription>
                    Method {rate.deliveryMethodId} • Zone {rate.deliveryZoneId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_RATE_UPDATE]}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateRateMutation.isPending}
                      onClick={() =>
                        void updateRateMutation
                          .mutateAsync({
                            rateId: rate.id,
                            input: { baseFee: rate.baseFee },
                          })
                          .then(() => toast.success('Delivery rate synced.'))
                          .catch((error: unknown) =>
                            toast.error(
                              _humanizeError(error, 'Could not update delivery rate.'),
                            ),
                          )
                      }
                    >
                      Sync
                    </Button>
                  </RequirePermission>
                  <RequirePermission all={[DELIVERY_PERMISSIONS.DELIVERY_RATE_DELETE]}>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteRateMutation.isPending}
                      onClick={() =>
                        void deleteRateMutation
                          .mutateAsync(rate.id)
                          .then(() => toast.success('Delivery rate deleted.'))
                          .catch((error: unknown) =>
                            toast.error(
                              _humanizeError(error, 'Could not delete delivery rate.'),
                            ),
                          )
                      }
                    >
                      Delete
                    </Button>
                  </RequirePermission>
                </CardContent>
              </Card>
            ))}
          </div>
        </ManageAsyncState>
      </ManageSection>
    </div>
  )
}

function _humanizeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message
  return fallback
}
