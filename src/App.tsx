import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from './lib/utils';
import { Loader2Icon, PackageOpenIcon, Trash2Icon } from 'lucide-react';
import { Button } from './components/ui/button';
import { getPresignedUrl } from './services/getPresignedUrl';
import { uploadFile } from './services/uploadFile';
import { Progress } from './components/ui/progress';
import { toast, Toaster } from 'sonner';

function App() {
  const [uploads, setUploads] = useState<{file: File, progress: number}[]>([]);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setUploads(prevState => prevState.concat(acceptedFiles.map(file => ({ file, progress: 0 }))));
    },
  });

  function handleRemoveUpload(removingIndex: number) {
    setUploads(prevState => {
      const newFiles = [...prevState];
      newFiles.splice(removingIndex, 1);
      return newFiles;
    });
  }

  async function handleUpload() {
    setLoading(true);
    try {
      const urls = await Promise.all(
      uploads.map(async ({file}) => ({
        file,
        url: await getPresignedUrl(file),
      }))
    );

      const response = await Promise.allSettled(urls.map(({ file, url }, index) => (
      uploadFile(file, url.signedUrl, (progress) => {
          setUploads(prevState => {
      const newState = [...prevState];
      const upload= newState[index]
      newState[index] = {
        ...upload,
        progress,
      };
      return newState;
    });
      })
     )));
    
     response.forEach((response,index ) => {
      if (response.status === 'rejected') {
        const fileWithError = urls[index].file;
        console.error(`Upload failed for file ${fileWithError.name}:`, response.reason);
      }})
    } catch (error) {} finally {
      toast.success('Upload concluído com sucesso!');
      setUploads([]);
      setLoading(false);
    }
  }



  return (
    <div className="min-h-screen flex justify-center py-20 px-6">
      <Toaster/>
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

        {uploads.length > 0 && (
          <div className='mt-10'>
            <h2 className='font-medium text-2xl tracking-tight'>Arquivos selecionados</h2>

            <div className='mt-4 space-y-2'>
              {uploads.map(({file, progress}, index) => (
              <div
                key={index} className='border p-3 rounded-md '>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm '>
                    {file.name}
                    </span>

                    <Button variant={"destructive"} size={"icon"} onClick={() => handleRemoveUpload(index)}>
                    <Trash2Icon className='size-4' />
                    </Button>
                  </div>
                  <Progress value={progress} className='h-2 mt-3' />
                </div>
            ))}

            </div>
            <Button className='mt-4 w-full cursor-pointer gap-1' size='lg' onClick={handleUpload} disabled={loading}>
            {loading &&  <Loader2Icon className='size-4 animate-spin'/>}  
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
