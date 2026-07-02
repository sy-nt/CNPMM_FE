import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { RequirePermission } from '#/components/rbac/require-permission'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ApiError } from '#/lib/api/client'
import { listDeliveries, updateDeliveryStatus } from '#/lib/api/delivery'
import { formatPrice } from '#/lib/format'
import { DELIVERY_PERMISSIONS } from '#/lib/rbac/constants'
import { deliveryListResponseSchema } from '#/lib/schemas/delivery.schema'
import { ManageAsyncState } from '#/pages/manage/_manage-async-state'
import { ManageSection } from '#/pages/manage/_manage-section'
import { useManageAccessToken } from '#/pages/manage/_use-manage-access-token'

const DELIVERY_LIST_QUERY = {
  page: 1,
  limit: 30,
  sort: 'desc' as const,
}

export function ShopDeliveriesPage() {
  const accessToken = useManageAccessToken()
  const queryClient = useQueryClient()
  const [statusByDelivery, setStatusByDelivery] = useState<Record<string, string>>(
    {},
  )
  const [trackingByDelivery, setTrackingByDelivery] = useState<
    Record<string, string>
  >({})

  const deliveriesQuery = useQuery({
    queryKey: ['shop-deliveries', accessToken, DELIVERY_LIST_QUERY],
    queryFn: ({ signal }) => listDeliveries(accessToken, DELIVERY_LIST_QUERY, signal),
    select: (data) => deliveryListResponseSchema.parse(data),
  })

  const updateMutation = useMutation({
    mutationFn: (input: {
      deliveryId: string
      status: string
      trackingCode?: string
    }) =>
      updateDeliveryStatus(accessToken, input.deliveryId, {
        status: input.status,
        trackingCode: input.trackingCode,
      }),
    onSuccess: async () => {
      toast.success('Delivery status updated.')
      await queryClient.invalidateQueries({ queryKey: ['shop-deliveries'] })
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Could not update delivery status.'
      toast.error(message)
    },
  })

  const deliveries = deliveriesQuery.data?.items ?? []

  return (
    <ManageSection
      title="Shop deliveries"
      description="Monitor delivery records and update shipment status."
    >
      <ManageAsyncState
        isLoading={deliveriesQuery.isLoading}
        isError={deliveriesQuery.isError}
        isEmpty={deliveries.length === 0}
        emptyTitle="No deliveries found"
        emptyDescription="Delivery records will appear once orders are dispatched."
      >
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardHeader>
                <CardTitle className="text-base">Delivery {delivery.id}</CardTitle>
                <CardDescription>
                  Status {delivery.status} · Fee {formatPrice(delivery.fee) ?? delivery.fee}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`delivery-status-${delivery.id}`}>Status</Label>
                    <Input
                      id={`delivery-status-${delivery.id}`}
                      value={statusByDelivery[delivery.id] ?? delivery.status}
                      onChange={(event) =>
                        setStatusByDelivery((prev) => ({
                          ...prev,
                          [delivery.id]: event.target.value,
                        }))
                      }
                      placeholder="in_transit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`delivery-track-${delivery.id}`}>
                      Tracking code
                    </Label>
                    <Input
                      id={`delivery-track-${delivery.id}`}
                      value={trackingByDelivery[delivery.id] ?? ''}
                      onChange={(event) =>
                        setTrackingByDelivery((prev) => ({
                          ...prev,
                          [delivery.id]: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <RequirePermission
                  all={[DELIVERY_PERMISSIONS.DELIVERY_UPDATE_STATUS]}
                >
                  <Button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        deliveryId: delivery.id,
                        status: statusByDelivery[delivery.id] ?? delivery.status,
                        trackingCode:
                          trackingByDelivery[delivery.id].trim() || undefined,
                      })
                    }
                  >
                    Update delivery status
                  </Button>
                </RequirePermission>
              </CardContent>
            </Card>
          ))}
        </div>
      </ManageAsyncState>
    </ManageSection>
  )
}
