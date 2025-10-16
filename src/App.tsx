import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { DataTableStateEvent } from 'primereact/datatable'; // tells typescript it a datatable data
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { ChevronDown } from 'lucide-react';
         
         

// https://api.artic.edu/api/v1/artworks?page=1
//  title, place_of_origin, artist_display, inscriptions, date_start, date_end

type lazystate =  {
rows: number,
page: number,
first: number
}

type Artwork = {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string ;
    date_start: number;
    date_end: number;
};



function App() {
  const [data , setdata] = useState<Artwork[]>([]) 
  const [loading , setloading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const op = useRef<OverlayPanel>(null)   
   const [inputValue, setInputValue] = useState<any>('');
const [totalrecords , settotalrecords] = useState(0)


  const [lazystate , setlazyState] = useState<lazystate>({
    first: 0, // index postison of each page  
    rows: 5,
    page: 1,
  })

const FetchData = async() => {
  try {
    setloading(true)
   const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${lazystate.page}&limit=${lazystate.rows}`)
   setdata(response.data.data)
  //  console.log(response.data.data)
  settotalrecords(response.data.pagination.total)


 } catch (error) {
  console.log("Error while fetching the data " , error)
  setloading(false)

 } finally{
  setloading(false)
 }
} 
 
useEffect(() => {
  FetchData()
} , [lazystate]) 


const onpage = (e: DataTableStateEvent) => {
  setlazyState({
    rows: e?.rows,
    page: (e?.page ?? 0) + 1,
    first: e?.first
  });
  // commit beause of debud
  // console.log("Rows" , e.rows)
  // console.log("Page" , e.page)
  // console.log("First" , e.first)
}
 
// debudding 
// console.log("Total recordss" , totalrecords)
// console.log("First" , lazystate.first)
// console.log("lazystate" , lazystate.rows)



console.log( "selected rows" , selectedRows )

const handleSave = async() => {

try {

    if(Number(inputValue) > selectedRows.length) {
     setloading(true)
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${lazystate.page}&limit=${inputValue}`)
      // console.log(response.data.data)
      setSelectedRows(response.data.data)
      setdata(response.data.data)
      // console.log("If printed")

      
    } else {
      setloading(true)
      setSelectedRows(data.slice(0 , inputValue));
      // console.log("Else Printed")
    } 

} catch (error) {
  console.log("Error while fetching more data" , error)
  setloading(false)
} finally {
  setloading(false)
}
op.current?.hide()

}


  return (
    <div> 
  <div className="p-10 bg-white rounded-lg shadow-lg ">
  <DataTable
    value={data}
    paginator={true}
    lazy
    first={lazystate.first}
    rows={lazystate.rows}
    onPage={onpage}
    loading={loading}
    totalRecords={totalrecords}
    rowsPerPageOptions={[5, 10, 15, 25]}
    selectionMode={'multiple'}
    selection={selectedRows}
    onSelectionChange={(e) => setSelectedRows(e.value)}
    tableStyle={{ minWidth: '50rem' }}
    dataKey="id"
    className="p-datatable-smz"
   paginatorClassName='p-5 space-between'

  >
    <Column 
      selectionMode='multiple' 
      headerStyle={{ width: '5rem' }}
    />

    <Column 
      field="title" 
      header={
        <div className="flex items-center gap-5">
          <span>Title</span>
          <ChevronDown
            onClick={(e) => op.current?.toggle(e)}
            className="cursor-pointer transition-transform duration-200 hover:scale-110 text-gray-600 hover:text-blue-600 w-4 h-4"
          />
        </div>
      } 
      style={{ width: '25%' }}
     body={(rowData) => rowData?.title || "No data"}
    />

    <Column 
      field="place_of_origin" 
      header="Place of Origin" 
      style={{ width: '25%' }}
            body={(rowData) => rowData?.place_of_origin || "No data"}

    />

    <Column 
      field="artist_display" 
      header="Artist" 
      style={{ width: '25%' }}
          body={(rowData) => rowData?.artist_display || "No data"}
    />

    <Column 
      field="inscriptions" 
      header="Inscriptions" 
      style={{ width: '25%' }}
    body={(rowData) => rowData?.inscriptions || "No data"}
    />

    <Column
      field="date_start"
      header="Date Start"
      style={{ width: '25%' }}
      body={(rowData) => rowData?.date_start || "No data"}
    />

    <Column
      field="date_end"
      header="Date End"
      style={{ width: '25%' }}
        body={(rowData) => rowData?.date_end || "No data"}
    />
  </DataTable>

  <OverlayPanel
  ref={op}
  style={{
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    minWidth: '280px'
  }}
>
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="text-gray-900 font-medium text-base">
        Select Records
      </h4>
    </div>

    <InputText
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Enter number..."
      type="number"
    />

    <div className="flex gap-2 pt-2">
      <Button
        onClick={handleSave}
        className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors border-0"
      >
        Apply
      </Button>
      <Button
        onClick={() => op.current?.hide()}
        className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors border-0"
      >
        Cancel
      </Button>
    </div>
  </div>
</OverlayPanel>

</div>
   </div>
  )
}

export default App
