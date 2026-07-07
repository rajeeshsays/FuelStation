using FuelStationBE.DataAcccess;
using FuelStationBE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace FuelStationBE.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]
public class PumpController : ControllerBase
{
	// Use DI-provided DbContext
	private readonly FuelStationDbContext _context;

	public PumpController(FuelStationDbContext context)
	{
		_context = context;
	}
	[HttpGet]
	public ActionResult<IEnumerable<Pump>> GetAll()
	{
		var pumps = _context.Pumps.ToList();
		return Ok(pumps);
	}

	[HttpGet("{id}")]
	public ActionResult<Pump> Get(int id)
	{
		var pump = _context.Pumps.FirstOrDefault(p => p.Id == id);
		if (pump == null) return NotFound();
		return Ok(pump);
	}

	[HttpPost]
	public ActionResult<Pump> Create([FromBody] Pump pump)
	{
		if (pump == null) return BadRequest();
		_context.Pumps.Add(pump);
		_context.SaveChanges();
		return CreatedAtAction(nameof(Get), new { id = pump.Id }, pump);
	}

	[HttpPut("{id}")]
	public IActionResult Update(int id, [FromBody] Pump updated)
	{
		if (updated == null || id != updated.Id) return BadRequest();
		var existing = _context.Pumps.FirstOrDefault(p => p.Id == id);
		if (existing == null) return NotFound();
		existing.Name = updated.Name;
		existing.IsActive = updated.IsActive;
		_context.Pumps.Update(existing);
		_context.SaveChanges();
		return NoContent();
	}

	[HttpDelete("{id}")]
	public IActionResult Delete(int id)
	{
		var existing = _context.Pumps.FirstOrDefault(p => p.Id == id);
		if (existing == null) return NotFound();
		_context.Pumps.Remove(existing);
		_context.SaveChanges();
		return NoContent();
	}



}
