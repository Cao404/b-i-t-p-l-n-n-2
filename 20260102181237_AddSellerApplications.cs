using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellerHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BusinessLicenseStatus",
                table: "SellerApplications");

            migrationBuilder.DropColumn(
                name: "KycStatus",
                table: "SellerApplications");

            migrationBuilder.RenameColumn(
                name: "SubmittedAt",
                table: "SellerApplications",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "ReviewedAt",
                table: "SellerApplications",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "SellerApplications",
                newName: "RejectReason");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "SellerApplications",
                type: "int",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<string>(
                name: "Kyc",
                table: "SellerApplications",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kyc",
                table: "SellerApplications");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SellerApplications",
                newName: "ReviewedAt");

            migrationBuilder.RenameColumn(
                name: "RejectReason",
                table: "SellerApplications",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SellerApplications",
                newName: "SubmittedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "SellerApplications",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<string>(
                name: "BusinessLicenseStatus",
                table: "SellerApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "KycStatus",
                table: "SellerApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
