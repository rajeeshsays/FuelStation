using System.ComponentModel.DataAnnotations;

public class Location
{
    [Key]
    public short LocationId { get; set; }

    public string LocationName { get; set; }
   
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}