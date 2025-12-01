import { Aduan } from "../../types"
import { formatToWIB } from "../../utils/time"
import { Editor } from "@tinymce/tinymce-react"

interface AduanDetailProps {
  aduan: Aduan
  isAdmin?: boolean
  tanggapan?: string
  setTanggapan?: (value: string) => void
  onStatusChange?: (id: string, status: string) => void
  onSubmitTanggapan?: (e: React.FormEvent) => void
  onEditMasyarakat?: (id: string) => void
}

export function AduanDetail({ aduan, isAdmin = false, tanggapan, setTanggapan, onStatusChange, onSubmitTanggapan, onEditMasyarakat }: AduanDetailProps) {
  const statusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      menunggu: "warning",
      diproses: "info",
      selesai: "success",
      ditolak: "danger",
    }
    return colors[status?.toLowerCase()] || "secondary"
  }

  const sortedTanggapan =
    aduan.tanggapan && Array.isArray(aduan.tanggapan)
      ? isAdmin
        ? [...aduan.tanggapan].sort((a, b) => new Date(a.waktu_dibuat).getTime() - new Date(b.waktu_dibuat).getTime())
        : aduan.tanggapan.slice().reverse()
      : []

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-file-text me-2"></i>
          Detail Aduan
        </h5>
      </div>
      <div className="card-body p-0">
        <div className="p-3 p-md-4 border-bottom bg-light">
          <h4 className="mb-3">{aduan.judul}</h4>
          <div className="row g-3">
            {isAdmin && (
              <div className="col-12 col-sm-6 col-md-3">
                <div className="d-flex align-items-start">
                  <i className="bi bi-person text-primary me-2 mt-1"></i>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <small className="text-muted d-block">Pelapor</small>
                    {onEditMasyarakat ? (
                      <button className="btn btn-link p-0 text-decoration-none fw-bold text-start text-break" onClick={() => onEditMasyarakat(aduan.id_masyarakat)} style={{ fontSize: "inherit" }}>
                        {aduan.nama_lengkap}
                      </button>
                    ) : (
                      <strong className="d-block text-break">{aduan.nama_lengkap}</strong>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className={`col-12 col-sm-6 col-md-${isAdmin ? 3 : 4}`}>
              <div className="d-flex align-items-start">
                <i className="bi bi-dash text-primary me-2 mt-1"></i>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <small className="text-muted d-block">Kategori</small>
                  <span className="d-block text-break">{aduan.kategori}</span>
                </div>
              </div>
            </div>
            <div className={`col-12 col-sm-6 col-md-${isAdmin ? 3 : 4}`}>
              <div className="d-flex align-items-start">
                <i className="bi bi-info-circle text-primary me-2 mt-1"></i>
                <div>
                  <small className="text-muted d-block">Status</small>
                  <span className={`badge bg-${statusBadgeColor(aduan.status)}`}>{aduan.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div className={`col-12 col-sm-6 col-md-${isAdmin ? 3 : 4}`}>
              <div className="d-flex align-items-start">
                <i className="bi bi-calendar text-primary me-2 mt-1"></i>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <small className="text-muted d-block">Tanggal Dibuat</small>
                  <strong className="d-block text-break">{formatToWIB(aduan.created_at || aduan.waktu_dibuat)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && onStatusChange && (
          <div className="p-3 p-md-4 border-bottom">
            <h6 className="mb-3">
              <i className="bi bi-pencil me-2"></i>
              Ubah Status Aduan
            </h6>
            <div className="row align-items-center g-3">
              <div className="col-12 col-md-4">
                <select className="form-select" value={aduan.status} onChange={(e) => onStatusChange(aduan.id, e.target.value)}>
                  <option value="menunggu">Menunggu</option>
                  <option value="diproses">Sedang Diproses</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <div className="col-12 col-md-8">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Status akan diperbarui otomatis setelah memilih
                </small>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 p-md-4 border-bottom">
          <h6 className="mb-3">
            <i className="bi bi-file-earmark me-2"></i>
            Isi Aduan
          </h6>
          <div className="card bg-light">
            <div className="card-body">
              <div className="mb-0 overflow-auto" style={{ wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: aduan.isi_aduan || aduan.isi }} />
            </div>
          </div>
        </div>

        {sortedTanggapan.length > 0 && (
          <div className="p-3 p-md-4 border-bottom">
            <h6 className="mb-3">
              <i className="bi bi-chat me-2"></i>
              {isAdmin ? `Riwayat Tanggapan (${sortedTanggapan.length})` : `Tanggapan dari Perangkat Desa (${sortedTanggapan.length})`}
            </h6>
            <div className="timeline">
              {sortedTanggapan.map((t: { id: string; nama_lengkap: string; waktu_dibuat: string; isi_tanggapan: string; roles?: string }, index: number) => (
                <div key={t.id} className="mb-3">
                  <div className={`card border-left-${t.roles === "masyarakat" ? "info" : "primary"}`}>
                    <div className="card-body p-3">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-2 gap-2">
                        <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0 }}>
                          <div
                            className={`bg-${t.roles === "masyarakat" ? "info" : "primary"} text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0`}
                            style={{ width: "32px", height: "32px", fontSize: "14px" }}
                          >
                            {t.nama_lengkap.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <strong className="d-block text-break">{t.nama_lengkap}</strong>
                            <small className="text-muted d-block">
                              <i className="bi bi-clock me-1"></i>
                              <span className="text-break">{formatToWIB(t.waktu_dibuat)}</span>
                              {t.roles && (
                                <span className={`badge ms-2 bg-${t.roles === "masyarakat" ? "info" : "success"} text-white`}>
                                  {t.roles === "masyarakat" ? "Masyarakat" : "Admin"}
                                </span>
                              )}
                            </small>
                          </div>
                        </div>
                        <span className={`badge bg-${t.roles === "masyarakat" ? "info" : "success"} flex-shrink-0`}>Tanggapan #{index + 1}</span>
                      </div>
                      <div className="mb-0 mt-2 overflow-auto" style={{ lineHeight: "1.8", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: t.isi_tanggapan }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {((isAdmin && setTanggapan !== undefined && onSubmitTanggapan) || (!isAdmin && setTanggapan !== undefined && onSubmitTanggapan)) && (
          <div className="p-3 p-md-4 bg-light">
            <h6 className="mb-3">
              <i className="bi bi-plus-circle me-2"></i>
              {isAdmin ? "Tambah Tanggapan Baru" : "Balas Tanggapan"}
            </h6>
            <form onSubmit={onSubmitTanggapan}>
              <div className="mb-3">
                <div className="overflow-auto">
                  <Editor
                    apiKey="5p7jggzxeaaa6qzzvu2f7rfvt3yzdrzu3oxiv5wyoyyv9v3v"
                    value={tanggapan}
                    onEditorChange={(content) => setTanggapan(content)}
                    init={{
                      height: 300,
                      menubar: false,
                      branding: false,
                      promotion: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "table",
                        "code",
                        "help",
                        "wordcount",
                      ],
                      toolbar:
                        "undo redo | blocks | " +
                        "bold italic forecolor | alignleft aligncenter " +
                        "alignright alignjustify | bullist numlist outdent indent | " +
                        "removeformat | image | help",
                      content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .tox .tox-statusbar__branding { display: none !important; } img { max-width: 200px; height: auto; }",
                      image_advtab: false,
                      image_title: true,
                      image_dimensions: false,
                      automatic_uploads: true,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      setup: (editor: any) => {
                        // Hide any setup dialogs or promotions
                        editor.on("init", () => {
                          const branding = editor.getContainer().querySelector(".tox-statusbar__branding")
                          if (branding) branding.style.display = "none"
                        })
                        
                        // Limit image width to 200px on paste/insert
                        editor.on("NodeChange", (e: { element: HTMLElement }) => {
                          if (e.element.nodeName === "IMG") {
                            const img = e.element as HTMLImageElement
                            if (!img.style.maxWidth || parseInt(img.style.maxWidth) > 200) {
                              img.style.maxWidth = "200px"
                              img.style.height = "auto"
                            }
                          }
                        })
                      },
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      images_upload_handler: async (blobInfo: any) => {
                        // Check file size (max 1MB)
                        if (blobInfo.blob().size > 1 * 1024 * 1024) {
                          throw new Error("Ukuran gambar maksimal 1MB")
                        }

                        const formDataUpload = new FormData()
                        formDataUpload.append("file", blobInfo.blob(), blobInfo.filename())

                        const response = await fetch("/api/aduan/upload-image", {
                          method: "POST",
                          body: formDataUpload,
                          credentials: "include",
                        })

                        if (!response.ok) {
                          throw new Error("Upload failed")
                        }

                        const data = await response.json()
                        return data.location
                      },
                    }}
                  />
                </div>
                <small className="text-muted mt-1 d-block">
                  <i className="bi bi-info-circle me-1"></i>
                  {isAdmin ? "Tanggapan akan dikirimkan kepada pelapor" : "Balasan Anda akan terlihat oleh admin"}
                </small>
              </div>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-send me-2"></i>
                  {isAdmin ? "Kirim Tanggapan" : "Kirim Balasan"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setTanggapan("")}>
                  <i className="bi bi-x-circle me-2"></i>
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
