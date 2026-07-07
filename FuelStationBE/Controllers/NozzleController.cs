using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FuelStationBE.DataAcccess;
using FuelStationBE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FuelStationBE.Controllers
{
    // Minimal Nozzle model placeholder in case real model exists in another namespace.
    // If a real model exists, this partial definition will not be used by the compiler.

    // Minimal DbContext placeholder type name used by controller. Replace with actual context type if present.
    


    [Route("api/[controller]")]
    [ApiController]
    public class NozzleController : ControllerBase
    {
        private readonly FuelStationDbContext _context;

        public NozzleController(FuelStationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Nozzle>>> GetAll()
        {
            return await _context.Nozzles.AsNoTracking().ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Nozzle>> Get(int id)
        {
            var nozzle = await _context.Nozzles.FindAsync(id);
            if (nozzle == null) return NotFound();
            return nozzle;
        }

        [HttpPost]
        public async Task<ActionResult<Nozzle>> Create(Nozzle nozzle)
        {
            _context.Nozzles.Add(nozzle);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = nozzle.Id }, nozzle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Nozzle nozzle)
        {
            if (id != nozzle.Id) return BadRequest();
            _context.Entry(nozzle).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Nozzles.AnyAsync(n => n.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var nozzle = await _context.Nozzles.FindAsync(id);
            if (nozzle == null) return NotFound();
            _context.Nozzles.Remove(nozzle);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
