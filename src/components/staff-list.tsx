
import {Button} from '@/components/ui/button'
import {Staff} from '@/lib/types'
export default function StaffList(staffs : Staff[])
{
    return (<>
   <p>Staff List</p>
    <table>
        <thead>

        </thead>
        <tbody>
            {staffs.map(staff => 
<tr>
   
    <td>
      
      {staff.name}
    </td>



</tr>)}
        </tbody>
    </table>

    </>)
}