import { Masyarakat } from "../../../types"

interface StatsCardsMasyarakatProps {
  masyarakat: Masyarakat[]
}

export function StatsCardsMasyarakat({ masyarakat }: StatsCardsMasyarakatProps) {
  return (
    <div className="row g-0 g-md-1">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body p-1 p-md-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Total Masyarakat</div>
                <div className="h4 mb-0">{masyarakat.length}</div>
              </div>
              <i className="bi bi-person text-primary" style={{ fontSize: "2rem" }}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
