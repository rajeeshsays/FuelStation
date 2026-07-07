using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuelStationBE.Models
{
public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string Password {get;set;}
        public short RoleId {get;set;}

        [ForeignKey("RoleId")]
        public virtual Role? Role {get;set;}
    }
public class Role
    {
        public short RoleId {get;set;}
        public string RoleName {get;set;}

    }
public class Station
    {
        public int Id { get; set; }
        public short LocationId { get; set; }
        public System.Collections.Generic.List<Pump> Pumps { get; set; }
    }
public class Fuel
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public decimal PricePerLiter { get; set; }
    }
public class Pump
{
    [Key]
    public short PumpId {get;set;}
    public string PumpName {get;set;} 

    public short LocationId {get;set;}


    [ForeignKey("LocationId")]
    public Location? Location {get;set;} 

    public bool IsActive {get;set;}

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
public class Shift
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string ShiftName { get; set; }

        // Use TimeSpan to represent a time of day for shift start/end
        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }



        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public Shift()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }
    }
public class Nozzle
    {
        [Key]
        public int Id { get; set; }

        // e.g., 1, 2, 3 for nozzle positions on a pump
        public short Number { get; set; }

        // Fuel type served by this nozzle (e.g., Diesel, Petrol)
        [MaxLength(100)]
        public string? FuelType { get; set; }

        // Foreign key to Pump
        public int PumpId { get; set; }

        [ForeignKey("PumpId")]
        public Pump? Pump { get; set; }

        public bool IsActive { get; set; } = true;
    }
public class Transaction
    {
        [Key]
        public int Id { get; set; }
        public int PumpId { get; set; }

        [ForeignKey("PumpId")]
        public virtual Pump? Pump { get; set; }
        public int FuelId { get; set; }

        [ForeignKey("FuelId")]
        public virtual Fuel? Fuel { get; set; }
        public decimal Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime Timestamp { get; set; }
    }
public class Staff
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(50)]
        public string Role { get; set; }

        public bool IsActive { get; set; } = true;

        // For authentication, store hashed password (not plain-text)
        [MaxLength(500)]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }


        public short ManagerId {get;set;}

        [ForeignKey("ManagerId")]
        public Staff? Manager {get;set;}
    }

public class Location
{
    [Key]
    public short LocationId { get; set; }

    public string LocationName { get; set; }
   
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
public class ShiftAssign
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ShiftId { get; set; }


        [Required]
        public short InchargeId { get; set; }

      
        [Required]
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;



        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

public class ShiftAssignmentStaff
{
    [Key]
    public int Id { get; set; }

    public int ShiftAssignmentId { get; set; }

    [ForeignKey("StaffId")]
    public Staff Staff {get;set;}
    public short StaffId { get; set; }
    
}

public class IntraLocation
    {
        [Key]
        public short Id {get;set;}
        public string IntraLocationName {get;set;}
    }


}