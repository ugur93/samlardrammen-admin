export enum RelationType {
    SPOUSE = 'spouse',
    PARENT = 'parent',
    KID = 'kid',
}

export const relationTypeLabels: Record<RelationType, string> = {
    [RelationType.SPOUSE]: 'Ektefelle',
    [RelationType.PARENT]: 'Forelder',
    [RelationType.KID]: 'Barn',
};
