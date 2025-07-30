import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { PackageOpenIcon, Trash2Icon } from 'lucide-react';
import { Button } from './components/ui/button';

function App() {
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(prevState => prevState.concat(acceptedFiles));
    },
  });

  function handleRemoveFile(removingIndex: number) {
    setFiles(prevState => {
      const newFiles = [...prevState];
      newFiles.splice(removingIndex, 1);
      return newFiles;
    });
  }

  return (
    <div className="min-h-screen flex justify-center py-20 px-6">
      <div className="w-full max-w-xl">
        <div
          {...getRootProps()}
          className={cn(
            'border h-60 w-full border-dashed transition-colors flex items-center justify-center flex-col cursor-pointer',
            isDragActive && 'bg-accent/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="transform transition-all mb-2">
            <PackageOpenIcon className="size-10 stroke-1 mb-2" />
          </div>

          <span>Solte seus arquivos aqui</span>
          <small className="text-muted-foreground">
            Apenas arquivos PNG de até 1MB
          </small>
        </div>

        {files.length > 0 && (
          <div className='mt-10'>
            <h2 className='font-medium text-2xl tracking-tight'>Arquivos selecionados</h2>

            <div className='mt-4 space-y-2'>
              {files.map((file, index) => (
              <div
                key={index} className='border p-3 rounded-md flex justify-between items-center'>
                  <span className='text-sm '>
                    {file.name}
                    </span>

                    <Button variant={"destructive"} size={"icon"} onClick={() => handleRemoveFile(index)}>
                    <Trash2Icon className='size-4' />
                    </Button>
                </div>
            ))}

            </div>
            <Button className='mt-4 w-full cursor-pointer' size='lg'>
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
