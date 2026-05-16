using BudgetApp.Services;

namespace BudgetApp.Pages;

public partial class TransactionsPage : ContentPage
{
    private readonly AuthService _auth;
    private readonly ApiService _api;
    private readonly LocalDbService _localDb;

    private string _typeFilter = "";
    private int _month = DateTime.Now.Month;

    public TransactionsPage(AuthService auth, ApiService api, LocalDbService localDb)
    {
        InitializeComponent();
        _auth = auth;
        _api = api;
        _localDb = localDb;
        SetupFilters();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await LoadAsync();
    }

    private void SetupFilters()
    {
        TypeFilter.Items.Add("Wszystkie");
        TypeFilter.Items.Add("Wydatki");
        TypeFilter.Items.Add("Przychody");
        TypeFilter.SelectedIndex = 0;

        string[] months = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
                           "Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
        foreach (var m in months) MonthFilter.Items.Add(m);
        MonthFilter.SelectedIndex = _month - 1;
    }

    private async Task LoadAsync()
    {
        try
        {
            var type = TypeFilter.SelectedIndex switch { 1 => "expense", 2 => "income", _ => "" };
            var data = await _api.GetTransactionsAsync(_auth.Token!, month: _month, year: DateTime.Now.Year);
            var items = data?.Items ?? new();

            if (!string.IsNullOrEmpty(type))
                items = items.Where(t => t.Type == type).ToList();

            TxList.ItemsSource = items.Select(t => new TransactionItem
            {
                Id = t.Id,
                Title = t.Title,
                CategoryDisplay = t.Category != null ? $"{t.Category.Icon} {t.Category.Name}" : "Brak kategorii",
                AmountDisplay = (t.Type == "income" ? "+" : "-") + t.Amount.ToString("N2", new System.Globalization.CultureInfo("pl-PL")) + " zł",
                AmountColor = t.Type == "income" ? "#22c55e" : "#ef4444",
                DateDisplay = t.Date.ToString("dd.MM.yyyy"),
            }).ToList();
        }
        catch
        {
            var cached = await _localDb.GetCachedTransactionsAsync();
            TxList.ItemsSource = cached.Select(c => new TransactionItem
            {
                Id = c.RemoteId,
                Title = c.Title + (c.PendingSync ? " ⏳" : ""),
                CategoryDisplay = $"{c.CategoryIcon} {c.CategoryName}",
                AmountDisplay = (c.Type == "income" ? "+" : "-") + c.Amount.ToString("N2") + " zł",
                AmountColor = c.Type == "income" ? "#22c55e" : "#ef4444",
                DateDisplay = c.Date.ToString("dd.MM.yyyy"),
            }).ToList();
        }
    }

    private void OnFilterChanged(object sender, EventArgs e)
    {
        _month = MonthFilter.SelectedIndex + 1;
        _ = LoadAsync();
    }

    private async void OnRefresh(object sender, EventArgs e)
    {
        await LoadAsync();
        Refresh.IsRefreshing = false;
    }

    private async void OnDelete(object sender, EventArgs e)
    {
        if (sender is SwipeItem item && item.CommandParameter is int id && id > 0)
        {
            bool confirm = await DisplayAlert("Usuń", "Usunąć tę transakcję?", "Tak", "Nie");
            if (!confirm) return;
            try
            {
                await _api.DeleteTransactionAsync(_auth.Token!, id);
                await LoadAsync();
            }
            catch { await DisplayAlert("Błąd", "Nie udało się usunąć transakcji", "OK"); }
        }
    }

    private async void OnAdd(object sender, EventArgs e)
        => await Shell.Current.GoToAsync(nameof(AddTransactionPage));
}
