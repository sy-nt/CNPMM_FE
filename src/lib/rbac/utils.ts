type UnionToIntersection<TUnion> = (
  TUnion extends unknown ? (x: TUnion) => void : never
) extends (x: infer TIntersection) => void
  ? TIntersection
  : never

export function buildModulePermissionsMap<
  TModules extends Record<string, string>,
  TActions extends Record<string, string>,
>(
  modules: TModules,
  actions: TActions,
): Readonly<
  Record<
    `${keyof TModules & string}_${keyof TActions & string}`,
    `${TModules[keyof TModules]}:${TActions[keyof TActions]}`
  >
> {
  return Object.freeze(
    Object.fromEntries(
      (Object.keys(modules) as Array<keyof TModules & string>).flatMap(
        (module) =>
          (Object.keys(actions) as Array<keyof TActions & string>).map(
            (action) => [
              `${module}_${action}`,
              `${modules[module]}:${actions[action]}`,
            ],
          ),
      ),
    ),
  ) as Readonly<
    Record<
      `${keyof TModules & string}_${keyof TActions & string}`,
      `${TModules[keyof TModules]}:${TActions[keyof TActions]}`
    >
  >
}

export function mergePermissionMaps<
  const TMaps extends Array<Readonly<Record<string, string>>>,
>(...maps: TMaps): Readonly<UnionToIntersection<TMaps[number]>> {
  return Object.freeze(Object.assign({}, ...maps)) as Readonly<
    UnionToIntersection<TMaps[number]>
  >
}
