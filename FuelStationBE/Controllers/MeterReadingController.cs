using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FuelStationBE.DataAcccess;
using Microsoft.AspNetCore.Mvc;

namespace FuelStationBE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeterReadingController : ControllerBase
    {
        // NOTE: This is a lightweight in-memory placeholder implementation
        // Replace with real DB/context/service calls in production.
        private readonly FuelStationDbContext _context;

        public MeterReadingController(FuelStationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<MeterReadingDto>> GetAll()
        {
            return Ok(_context);
        }

        [HttpGet("{id}")]
        public ActionResult<MeterReadingDto> GetById(Guid id)
        {
            var item = _context.MeterReadings.FirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public ActionResult<MeterReadingDto> Create([FromBody] CreateMeterReadingRequest req)
        {
            if (req == null) return BadRequest();

            var dto = new MeterReadingDto
            {
                Id = Guid.NewGuid(),
                NozzleId = req.NozzleId,
                Reading = req.Reading,
                Timestamp = req.Timestamp == default ? DateTime.UtcNow : req.Timestamp
            };

            _context.Add(dto);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        [HttpPut("{id}")]
        public ActionResult Update(Guid id, [FromBody] UpdateMeterReadingRequest req)
        {
            var item = _context.FirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound();
            if (req == null) return BadRequest();

            item.Reading = req.Reading;
            item.Timestamp = req.Timestamp == default ? item.Timestamp : req.Timestamp;

            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(Guid id)
        {
            var item = _context.FirstOrDefault(x => x.Id == id);
            if (item == null) return NotFound();
            _context.Remove(item);
            return NoContent();
        }
    }

    // DTOs and request models
    public class MeterReadingDto
    {
        public Guid Id { get; set; }
        public Guid NozzleId { get; set; }
        public decimal Reading { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class CreateMeterReadingRequest
    {
        public Guid NozzleId { get; set; }
        public decimal Reading { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class UpdateMeterReadingRequest
    {
        public decimal Reading { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
