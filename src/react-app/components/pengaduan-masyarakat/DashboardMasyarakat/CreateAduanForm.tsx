import { Editor } from '@tinymce/tinymce-react'

interface CreateAduanFormProps {
  formData: {
    judul: string
    kategori: string
    isi_aduan: string
  }
  setFormData: (data: { judul: string; kategori: string; isi_aduan: string }) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function CreateAduanForm({ formData, setFormData, onSubmit, onCancel }: CreateAduanFormProps) {
  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Buat Aduan Baru
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-type me-2"></i>
              Judul Aduan *
            </label>
            <input
              type="text"
              className="form-control"
              style={{ height: "60px" }}
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Masukkan judul aduan..."
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-dash me-2"></i>
              Kategori *
            </label>
            <select className="form-select" style={{ height: "60px" }} value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} required>
              <option value="">Pilih Kategori</option>
              <option value="INFRASTRUKTUR">Infrastruktur</option>
              <option value="PELAYANAN">Pelayanan Publik</option>
              <option value="LINGKUNGAN">Lingkungan</option>
              <option value="SOSIAL">Sosial Kemasyarakatan</option>
              <option value="EKONOMI">Ekonomi</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">
              <i className="bi bi-file-text me-2"></i>
              Isi Aduan *
            </label>
            <Editor
              apiKey='5p7jggzxeaaa6qzzvu2f7rfvt3yzdrzu3oxiv5wyoyyv9v3v'
              value={formData.isi_aduan}
              onEditorChange={(content) => setFormData({ ...formData, isi_aduan: content })}
              init={{
                height: 400,
                menubar: false,
                branding: false,
                promotion: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | image | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .tox .tox-statusbar__branding { display: none !important; }',
                image_advtab: false,
                image_title: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setup: (editor: any) => {
                  // Hide any setup dialogs or promotions
                  editor.on('init', () => {
                    const branding = editor.getContainer().querySelector('.tox-statusbar__branding');
                    if (branding) branding.style.display = 'none';
                  });
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                images_upload_handler: async (blobInfo: any) => {
                  // Check file size (max 1MB)
                  if (blobInfo.blob().size > 1 * 1024 * 1024) {
                    throw new Error('Ukuran gambar maksimal 1MB');
                  }

                  const formDataUpload = new FormData()
                  formDataUpload.append('file', blobInfo.blob(), blobInfo.filename())

                  const response = await fetch('/api/aduan/upload-image', {
                    method: 'POST',
                    body: formDataUpload,
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  })

                  if (!response.ok) {
                    throw new Error('Upload failed')
                  }

                  const data = await response.json()
                  return data.location
                }
              }}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              <i className="bi bi-x me-2"></i>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-send me-2"></i>
              Kirim Aduan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
