using BudgetApp.Models;
using BudgetApp.Services;

namespace BudgetApp.Pages;

public partial class AddTransactionPage : ContentPage
{
    private readonly AuthService _auth;
    private readonly ApiService _api;
    private readonly LocalDbService _localDb;

    private string _type = "expense";
    private List<CategoryDto> _categories = new();
    private string _locationNote = "";

    public AddTransactionPage(AuthService auth, ApiService api, LocalDbService localDb)
    {
        InitializeComponent();
        _auth = auth;
        _api = api;
        _localDb = localDb;
        DatePicker.Date = DateTime.Today;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await LoadCategoriesAsync();
    }

    private async Task LoadCategoriesAsync()
    {
        try
        {
            var cats = await _api.GetCategoriesAsync(_auth.Token!);
            _categories = cats?.Where(c => c.Type == _type).ToList() ?? new();
            CategoryPicker.Items.Clear();
            foreach (var c in _categories)
                CategoryPicker.Items.Add($"{c.Icon} {c.Name}");
        }
        catch { /* offline – no categories */ }
    }

    private async void OnExpense(object sender, EventArgs e)
    {
        _type = "expense";
        ExpenseBtn.BackgroundColor = Color.FromArgb("#ef4444");
        ExpenseBtn.TextColor = Colors.White;
        IncomeBtn.BackgroundColor = Color.FromArgb("#161e2e");
        IncomeBtn.TextColor = Color.FromArgb("#7a92b0");
        await LoadCategoriesAsync();
    }

    private async void OnIncome(object sender, EventArgs e)
    {
        _type = "income";
        IncomeBtn.BackgroundColor = Color.FromArgb("#22c55e");
        IncomeBtn.TextColor = Colors.White;
        ExpenseBtn.BackgroundColor = Color.FromArgb("#161e2e");
        ExpenseBtn.TextColor = Color.FromArgb("#7a92b0");
        await LoadCategoriesAsync();
    }

    // 🌍 Native feature: Geolocation
    private async void OnGetLocation(object sender, EventArgs e)
    {
        try
        {
            var status = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
            if (status != PermissionStatus.Granted)
                status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();

            if (status != PermissionStatus.Granted)
            {
                LocationLabel.Text = "Brak uprawnień do lokalizacji";
                return;
            }

            LocationLabel.Text = "Pobieranie lokalizacji…";
            var loc = await Geolocation.GetLocationAsync(new GeolocationRequest(GeolocationAccuracy.Medium));
            if (loc is not null)
            {
                _locationNote = $"📍 {loc.Latitude:F4}, {loc.Longitude:F4}";
                LocationLabel.Text = _locationNote;
                LocationLabel.TextColor = Color.FromArgb("#22c55e");
            }
        }
        catch (FeatureNotSupportedException)
        {
            LocationLabel.Text = "Geolokalizacja niedostępna";
        }
        catch (Exception ex)
        {
            LocationLabel.Text = $"Błąd: {ex.Message}";
        }
    }

    private async void OnSave(object sender, EventArgs e)
    {
        ErrorLabel.IsVisible = false;

        if (string.IsNullOrWhiteSpace(TitleEntry.Text))
        { ErrorLabel.Text = "Podaj tytuł"; ErrorLabel.IsVisible = true; return; }

        if (!decimal.TryParse(AmountEntry.Text?.Replace(',', '.'), System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out decimal amount) || amount <= 0)
        { ErrorLabel.Text = "Podaj poprawną kwotę"; ErrorLabel.IsVisible = true; return; }

        int? categoryId = null;
        if (CategoryPicker.SelectedIndex >= 0 && CategoryPicker.SelectedIndex < _categories.Count)
            categoryId = _categories[CategoryPicker.SelectedIndex].Id;

        var note = NoteEntry.Text ?? "";
        if (!string.IsNullOrEmpty(_locationNote))
            note = string.IsNullOrEmpty(note) ? _locationNote : $"{note} | {_locationNote}";

        var data = new TransactionCreateDto
        {
            Title = TitleEntry.Text.Trim(),
            Amount = amount,
            Type = _type,
            Note = note,
            Date = DatePicker.Date,
            CategoryId = categoryId,
        };

        SaveBtn.IsEnabled = false;
        SaveBtn.Text = "Zapisywanie…";

        try
        {
            await _api.CreateTransactionAsync(_auth.Token!, data);
        }
        catch
        {
            // Offline – save locally
            await _localDb.AddPendingTransactionAsync(data);
            await DisplayAlert("Tryb offline", "Transakcja zostanie zsynchronizowana po przywróceniu połączenia.", "OK");
        }

        await Shell.Current.GoToAsync("..");
    }
}
