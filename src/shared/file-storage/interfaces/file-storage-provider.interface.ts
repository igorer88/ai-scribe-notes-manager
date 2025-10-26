export interface FileStorageProvider {
  saveFile(file: Express.Multer.File, filePath: string): Promise<string>
}
