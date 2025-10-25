import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions
} from 'class-validator'

import { CreateNoteDto } from '@/domain/note/dto'

@ValidatorConstraint({ async: false })
export class IsAudioFilePathValidConstraint
  implements ValidatorConstraintInterface
{
  validate(audioFilePath: string, args: ValidationArguments): boolean {
    const obj = args.object as CreateNoteDto
    if (obj.isVoiceNote) {
      return (
        typeof audioFilePath === 'string' && audioFilePath.trim().length > 0
      )
    }
    return (
      audioFilePath === undefined ||
      audioFilePath === null ||
      audioFilePath === ''
    )
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as CreateNoteDto
    if (obj.isVoiceNote) {
      return 'audioFilePath must be a non-empty string when isVoiceNote is true'
    }
    return 'audioFilePath should not be provided when isVoiceNote is false'
  }
}

export function IsAudioFilePathValid(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAudioFilePathValidConstraint
    })
  }
}
