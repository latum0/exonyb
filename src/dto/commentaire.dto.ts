import { IsString } from "class-validator";

export class CommentaireDto {
    @IsString()
    contenu!: string;

    constructor(data?: Partial<CommentaireDto>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}