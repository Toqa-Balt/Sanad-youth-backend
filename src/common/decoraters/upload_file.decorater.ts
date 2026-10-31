import { applyDecorators, BadRequestException, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
interface UploadFileOptions {
    fieldName: string;
    folder: string;
    allowedTypes: string[];
    maxSizeMB: number;
}

export function UploadFile(options: UploadFileOptions) {
    return applyDecorators(
        UseInterceptors(FileInterceptor(options.fieldName, {
            storage: diskStorage({
                destination: `./uploads/${options.folder}`,
                filename: (req, file, cb) => {
                    const uniqueName = randomUUID() + extname(file.originalname);
                    cb(null, uniqueName);
                },
            }),
            limits: { fileSize: options.maxSizeMB * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                if (!options.allowedTypes.includes(file.mimetype)) {
                    return cb(new BadRequestException('Invalid file type'), false);
                }

                cb(null, true);
            },
        }))
    )
}