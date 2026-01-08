export type FormattedLocality = {
  Id: number
  Code: string
  City: string
  Department: string
  Region: string
  typeId: number;
}

export type EditableFields = Omit<FormattedLocality, 'Id' | 'Code'>;
