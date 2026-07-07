using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FuelStationBE.Models;

namespace FuelStationBE.DataAcccess
{
    // Simple EF Core DbContext for the Fuel Management System.
    public class FuelStationDbContext : DbContext
    {
        public FuelStationDbContext(DbContextOptions<FuelStationDbContext> options)
            : base(options)
        {
        }

        // Define DbSets for the main aggregates. Add or remove entities as needed.
        public DbSet<User> Users { get; set; }
        public DbSet<Station> Stations { get; set; }
        public DbSet<Fuel> Fuels { get; set; }
        public DbSet<Pump> Pumps { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        public DbSet<Nozzle> Nozzles {get;set;}

        public DbSet<MeaterReading> MeaterReadings {get;set;}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Basic configuration examples. Adjust according to your entity definitions.
            modelBuilder.Entity<User>(eb =>
            {
                eb.HasKey(u => u.Id);
                eb.Property(u => u.Name).HasMaxLength(200).IsRequired();
            });

            modelBuilder.Entity<Station>(eb =>
            {
                eb.HasKey(s => s.Id);
                eb.Property(s => s.Location).HasMaxLength(500);
            });

            modelBuilder.Entity<Fuel>(eb =>
            {
                eb.HasKey(f => f.Id);
                eb.Property(f => f.Type).HasMaxLength(100).IsRequired();
            });

            modelBuilder.Entity<Pump>(eb =>
            {
                eb.HasKey(p => p.Id);
                eb.HasOne(p => p.Station).WithMany(s => s.Pumps).HasForeignKey(p => p.StationId);
            });

            modelBuilder.Entity<Transaction>(eb =>
            {
                eb.HasKey(t => t.Id);
                eb.HasOne(t => t.Pump).WithMany(p => p.Transactions).HasForeignKey(t => t.PumpId);
                eb.HasOne(t => t.Fuel).WithMany().HasForeignKey(t => t.FuelId);
            });
        }
    }

    // Minimal entity definitions to keep the DbContext self-contained.
    
}
