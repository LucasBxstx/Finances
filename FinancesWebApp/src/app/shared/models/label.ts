export interface Label {
    id: number,
    name: string,
    color: string,
    rowVersion: string | null,
}

export interface AddOrEditLabel {
    useCase: 'add' | 'edit';
    labelId: number | null; // Is null if useCase = 'add'
}