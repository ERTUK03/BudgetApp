using BudgetApp.Services;

namespace BudgetApp.Pages;

public partial class RegisterPage : ContentPage
{
    private readonly AuthService _auth;

    public RegisterPage(AuthService auth)
    {
        InitializeComponent();
        _auth = auth;
    }

    private async void OnRegister(object sender, EventArgs e)
    {
        ErrorLabel.IsVisible = false;
        RegisterBtn.IsEnabled = false;
        RegisterBtn.Text = "Rejestrowanie…";

        try
        {
            var ok = await _auth.RegisterAsync(
                EmailEntry.Text?.Trim() ?? "",
                UsernameEntry.Text?.Trim() ?? "",
                PasswordEntry.Text ?? "");

            if (ok)
                await Shell.Current.GoToAsync($"//{nameof(DashboardPage)}");
            else
            {
                ErrorLabel.Text = "Rejestracja nie powiodła się";
                ErrorLabel.IsVisible = true;
            }
        }
        catch (Exception ex)
        {
            ErrorLabel.Text = ex.Message;
            ErrorLabel.IsVisible = true;
        }
        finally
        {
            RegisterBtn.IsEnabled = true;
            RegisterBtn.Text = "Utwórz konto";
        }
    }

    private async void OnLogin(object sender, TappedEventArgs e)
        => await Shell.Current.GoToAsync("..");
}
